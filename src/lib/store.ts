import { createStore, produce } from "solid-js/store";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  createEventRow,
  eventExists,
  fetchEventRows,
  fetchPlayerRow,
  fetchRecentEvents,
  joinEventRow,
  subscribeToEvent,
  updateDrink,
} from "./db";
import {
  generateEditToken,
  getSessionForEvent,
  setSession,
  verifySessionForRows,
} from "./identity";
import type { DrinkField, MasterRow, RecentEvent } from "./types";
import { isValidEventCode, normalizeEventCode, normalizePlayerName, clampDrink } from "./types";

type AppStore = {
  rows: MasterRow[];
  eventName: string;
  playerName: string;
  editToken: string | null;
  loading: boolean;
  error: string;
  recentEvents: RecentEvent[];
  recentEventsLoading: boolean;
  form: {
    eventCode: string;
    playerName: string;
  };
};

const [state, setState] = createStore<AppStore>({
  rows: [],
  eventName: "",
  playerName: "",
  editToken: null,
  loading: false,
  error: "",
  recentEvents: [],
  recentEventsLoading: false,
  form: {
    eventCode: "",
    playerName: "",
  },
});

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

function setFormField(field: "eventCode" | "playerName", value: string) {
  setState("form", field, value);
}

function prefillEventCode(code: string) {
  setState("form", "eventCode", normalizeEventCode(code));
}

async function loadRecentEvents() {
  setState("recentEventsLoading", true);
  try {
    const events = await fetchRecentEvents(5);
    setState("recentEvents", events);
  } catch {
    setState("recentEvents", []);
  } finally {
    setState("recentEventsLoading", false);
  }
}

function validateForm(): { eventName: string; playerName: string } | null {
  const eventName = normalizeEventCode(state.form.eventCode);
  const playerName = normalizePlayerName(state.form.playerName);

  if (!isValidEventCode(state.form.eventCode)) {
    setError("Event code must be URL-safe (letters, numbers, -, _).");
    return null;
  }
  if (!playerName) {
    setError("Player name is required.");
    return null;
  }
  clearError();
  return { eventName, playerName };
}

function savePlayerSession(eventName: string, playerName: string, editToken: string) {
  setSession({ event_name: eventName, player_name: playerName, edit_token: editToken });
  setState({ eventName, playerName, editToken });
}

async function createEvent(): Promise<string | null> {
  const parsed = validateForm();
  if (!parsed) return null;

  setLoading(true);
  try {
    const token = generateEditToken();
    const row = await createEventRow(parsed.eventName, parsed.playerName, token);
    savePlayerSession(row.event_name, row.player_name, token);
    return `/event/${encodeURIComponent(row.event_name)}`;
  } catch (e) {
    setError(e instanceof Error ? e.message : "Could not create event.");
    return null;
  } finally {
    setLoading(false);
  }
}

async function joinEvent(): Promise<string | null> {
  const parsed = validateForm();
  if (!parsed) return null;

  setLoading(true);
  try {
    const exists = await eventExists(parsed.eventName);
    if (!exists) {
      setError("Event not found. Check the code or create a new event.");
      return null;
    }

    const existing = await fetchPlayerRow(parsed.eventName, parsed.playerName);

    if (existing) {
      const session = getSessionForEvent(parsed.eventName);
      const token =
        session?.player_name === existing.player_name &&
        session.edit_token === existing.edit_token
          ? session.edit_token
          : "";

      setSession({
        event_name: existing.event_name,
        player_name: existing.player_name,
        edit_token: token,
      });
      setState({
        eventName: existing.event_name,
        playerName: existing.player_name,
        editToken: token || null,
      });
      return `/event/${encodeURIComponent(existing.event_name)}`;
    }

    const token = generateEditToken();
    const row = await joinEventRow(parsed.eventName, parsed.playerName, token);
    savePlayerSession(row.event_name, row.player_name, token);
    return `/event/${encodeURIComponent(row.event_name)}`;
  } catch (e) {
    setError(e instanceof Error ? e.message : "Could not join event.");
    return null;
  } finally {
    setLoading(false);
  }
}

async function loadEvent(eventName: string) {
  setLoading(true);
  clearError();
  try {
    const rows = await fetchEventRows(eventName);
    if (rows.length === 0) {
      setError("Event not found.");
      setState("rows", []);
      return;
    }

    const session = getSessionForEvent(eventName);
    const preserved =
      state.eventName === eventName && state.playerName
        ? { playerName: state.playerName, editToken: state.editToken }
        : null;
    const fromSession = verifySessionForRows(session, rows);
    const identity = preserved ?? fromSession;

    setState({
      eventName,
      rows,
      playerName: identity.playerName,
      editToken: identity.editToken,
    });
  } catch (e) {
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

function setupRealtime(eventName: string) {
  teardownRealtime();
  channel = subscribeToEvent(eventName, () => {
    void fetchEventRows(eventName).then((rows) => {
      if (rows.length > 0) {
        setState("rows", rows);
        const { playerName, editToken } = verifySessionForRows(
          getSessionForEvent(eventName),
          rows
        );
        if (playerName) setState({ playerName, editToken });
      }
    });
  });
}

async function updateCell(
  playerName: string,
  field: DrinkField,
  value: number
): Promise<void> {
  const token = state.editToken;
  if (!token || !state.eventName || playerName !== state.playerName) return;

  const idx = state.rows.findIndex((r) => r.player_name === playerName);
  if (idx === -1) return;

  value = clampDrink(value);
  const prev = state.rows[idx][field];
  setState(
    produce((s) => {
      s.rows[idx][field] = value;
    })
  );

  try {
    await updateDrink(state.eventName, playerName, field, value, token);
  } catch (e) {
    setState(
      produce((s) => {
        s.rows[idx][field] = prev;
      })
    );
    setError(e instanceof Error ? e.message : "Update failed.");
  }
}

function resetForm() {
  setState({
    form: { eventCode: "", playerName: "" },
    error: "",
  });
}

export const appStore = {
  state,
  setFormField,
  prefillEventCode,
  loadRecentEvents,
  createEvent,
  joinEvent,
  loadEvent,
  setupRealtime,
  teardownRealtime,
  updateCell,
  resetForm,
  clearError,
};
