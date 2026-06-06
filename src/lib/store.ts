import { createMemo } from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getCurrentUser, signInWithEmail, signOut } from "./api/auth";
import { completeEvent as completeEventApi, createEvent as createEventApi, getEvent, getRecentEvents, joinEvent as joinEventApi } from "./api/events";
import { getParticipants, updateParticipantMetrics } from "./api/participants";
import { useLeaderboardStream } from "./api/realtime";
import { upsertUser } from "./api/users";
import { computeLeaderboard } from "./logic/scoring";
import type { AppUser, DrinkMetric, Event, Participant, RecentEvent } from "./types";
import { clampMetric, isValidEventCode, normalizeDisplayName, normalizeEventCode } from "./types";

type AppStore = {
  currentUser: AppUser | null;
  authLoading: boolean;
  event: Event | null;
  participants: Participant[];
  loading: boolean;
  error: string;
  recentEvents: RecentEvent[];
  recentEventsLoading: boolean;
  form: {
    eventName: string;
    eventCode: string;
    displayName: string;
  };
};

const [state, setState] = createStore<AppStore>({
  currentUser: null,
  authLoading: true,
  event: null,
  participants: [],
  loading: false,
  error: "",
  recentEvents: [],
  recentEventsLoading: false,
  form: {
    eventName: "",
    eventCode: "",
    displayName: "",
  },
});

const leaderboard = createMemo(() => computeLeaderboard(state.participants));

let channel: RealtimeChannel | null = null;

function setError(message: string) {
  setState("error", message);
}

function clearError() {
  setState("error", "");
}

function setLoading(loading: boolean) {
  setState("loading", loading);
}

function setFormField(field: "eventName" | "eventCode" | "displayName", value: string) {
  setState("form", field, value);
}

function prefillEventCode(code: string) {
  setState("form", "eventCode", normalizeEventCode(code));
}

function defaultDisplayName(user: Awaited<ReturnType<typeof getCurrentUser>>): string {
  return (
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Player"
  );
}

async function loadAuth() {
  setState("authLoading", true);
  try {
    const user = await getCurrentUser();
    if (!user) {
      setState("currentUser", null);
      return;
    }

    const appUser = await upsertUser({
      userId: user.id,
      email: user.email ?? null,
      displayName: defaultDisplayName(user),
    });

    setState("currentUser", appUser);
    if (!state.form.displayName) setState("form", "displayName", appUser.displayName);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Could not load session.");
  } finally {
    setState("authLoading", false);
  }
}

async function loginWithEmail() {
  const email = window.prompt("Enter your email to receive a sign-in link");
  if (!email) return;
  const trimmed = email.trim();
  await signInWithEmail(trimmed);
  window.alert(`Sent magic link to ${trimmed}.`);
}

async function logout() {
  await signOut();
  teardownRealtime();
  setState({
    currentUser: null,
    event: null,
    participants: [],
  });
}

async function loadRecentEvents() {
  setState("recentEventsLoading", true);
  try {
    const events = await getRecentEvents(5);
    setState("recentEvents", events);
  } catch {
    setState("recentEvents", []);
  } finally {
    setState("recentEventsLoading", false);
  }
}

function requireUser(): AppUser | null {
  if (state.currentUser) return state.currentUser;
  setError("Sign in with email to continue.");
  return null;
}

function validateCreateForm(): { eventName: string; displayName: string } | null {
  const eventName = state.form.eventName.trim();
  const displayName = normalizeDisplayName(state.form.displayName);

  if (!eventName) {
    setError("Event name is required.");
    return null;
  }
  if (!displayName) {
    setError("Display name is required.");
    return null;
  }
  clearError();
  return { eventName, displayName };
}

function validateJoinForm(): { eventCode: string; displayName: string } | null {
  const eventCode = normalizeEventCode(state.form.eventCode);
  const displayName = normalizeDisplayName(state.form.displayName);

  if (!isValidEventCode(eventCode)) {
    setError("Event code must be URL-safe letters, numbers, - or _.");
    return null;
  }
  if (!displayName) {
    setError("Display name is required.");
    return null;
  }
  clearError();
  return { eventCode, displayName };
}

async function createEvent(): Promise<string | null> {
  const user = requireUser();
  const parsed = validateCreateForm();
  if (!user || !parsed) return null;

  setLoading(true);
  try {
    const event = await createEventApi({
      eventName: parsed.eventName,
      createdBy: user.id,
      displayName: parsed.displayName,
    });
    setState("event", event);
    await loadParticipants(event.id);
    return `/event/${encodeURIComponent(event.eventCode)}`;
  } catch (e) {
    setError(e instanceof Error ? e.message : "Could not create event.");
    return null;
  } finally {
    setLoading(false);
  }
}

async function joinEvent(): Promise<string | null> {
  const user = requireUser();
  const parsed = validateJoinForm();
  if (!user || !parsed) return null;

  setLoading(true);
  try {
    await joinEventApi({
      eventCode: parsed.eventCode,
      userId: user.id,
      displayName: parsed.displayName,
    });
    return `/event/${encodeURIComponent(parsed.eventCode)}`;
  } catch (e) {
    setError(e instanceof Error ? e.message : "Could not join event.");
    return null;
  } finally {
    setLoading(false);
  }
}

async function loadParticipants(eventId: string) {
  const participants = await getParticipants(eventId);
  setState("participants", participants);
}

async function loadEvent(eventCode: string) {
  setLoading(true);
  clearError();
  try {
    const event = await getEvent(eventCode);
    setState("event", event);
    await loadParticipants(event.id);
  } catch (e) {
    setState("participants", []);
    setError(e instanceof Error ? e.message : "Could not load event.");
  } finally {
    setLoading(false);
  }
}

function teardownRealtime() {
  if (channel) {
    channel.unsubscribe();
    channel = null;
  }
}

function setupRealtime(eventId: string) {
  teardownRealtime();
  channel = useLeaderboardStream(eventId, () => {
    void loadParticipants(eventId);
  });
}

async function updateMetric(field: DrinkMetric, value: number): Promise<void> {
  const user = state.currentUser;
  const event = state.event;
  if (!user || !event || event.completedAt) return;

  const idx = state.participants.findIndex((p) => p.userId === user.id);
  if (idx === -1) return;

  const nextMetrics = {
    ...state.participants[idx].metrics,
    [field]: clampMetric(value),
  };
  const prevMetrics = state.participants[idx].metrics;

  setState(
    produce((s) => {
      s.participants[idx].metrics = nextMetrics;
    })
  );

  try {
    await updateParticipantMetrics({
      eventId: event.id,
      userId: user.id,
      metrics: nextMetrics,
    });
  } catch (e) {
    setState(
      produce((s) => {
        s.participants[idx].metrics = prevMetrics;
      })
    );
    setError(e instanceof Error ? e.message : "Update failed.");
  }
}

async function completeEvent(): Promise<void> {
  const event = state.event;
  const user = state.currentUser;
  if (!event || !user || event.createdBy !== user.id) return;

  setLoading(true);
  try {
    await completeEventApi(event.id);
    await loadEvent(event.eventCode);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Could not complete event.");
  } finally {
    setLoading(false);
  }
}

function resetForm() {
  setState({
    form: {
      eventName: "",
      eventCode: "",
      displayName: state.currentUser?.displayName ?? "",
    },
    error: "",
  });
}

export const appStore = {
  state,
  leaderboard,
  setFormField,
  prefillEventCode,
  loadAuth,
  loginWithEmail,
  logout,
  loadRecentEvents,
  createEvent,
  joinEvent,
  loadEvent,
  setupRealtime,
  teardownRealtime,
  updateMetric,
  completeEvent,
  resetForm,
  clearError,
};
