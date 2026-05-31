import { Show, createEffect, onCleanup, onMount } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { ShareEventButton } from "../components/ShareEventButton";
import { appStore } from "../lib/store";
import { normalizeEventCode } from "../lib/types";

export function EventPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = appStore;

  onMount(() => {
    void appStore.loadAuth();
    const eventCode = params.eventName ? normalizeEventCode(decodeURIComponent(params.eventName)) : "";
    if (!eventCode) {
      navigate("/", { replace: true });
      return;
    }
    void appStore.loadEvent(eventCode);
  });

  createEffect(() => {
    if (state.event?.id) appStore.setupRealtime(state.event.id);
  });

  onCleanup(() => appStore.teardownRealtime());

  const isParticipant = () =>
    !!state.currentUser && state.participants.some((p) => p.userId === state.currentUser?.id);
  const canComplete = () =>
    !!state.event &&
    !!state.currentUser &&
    state.currentUser.id === state.event.createdBy &&
    !state.event.completedAt;
  const needsJoin = () => !!state.currentUser && !!state.event && !isParticipant();
  const eventLabel = () => state.event?.eventName ?? "Event";
  const eventCode = () => state.event?.eventCode ?? params.eventName ?? "";

  return (
    <div class="page-stack">
      <div class="event-header">
        <div>
          <h2 class="page-title">
            {eventLabel()} <span class="event-code">{eventCode()}</span>
          </h2>
          <p class="page-sub">Live leaderboard with score-weighted metrics.</p>
        </div>
        <div class="event-actions">
          <ShareEventButton />
          <Show when={canComplete()}>
            <button type="button" class="btn btn--primary share-btn" onClick={() => void appStore.completeEvent()}>
              Complete
            </button>
          </Show>
        </div>
      </div>

      <Show when={state.error}>
        <div class="error">{state.error}</div>
      </Show>

      <Show when={needsJoin()}>
        <div class="join-callout">
          <p>You are viewing this event. Join it to enter metrics.</p>
          <button
            type="button"
            class="btn btn--primary"
            onClick={() => navigate(`/join?event=${encodeURIComponent(state.event!.eventCode)}`)}
          >
            Join event
          </button>
        </div>
      </Show>

      <Show when={state.loading && state.participants.length === 0} fallback={<LeaderboardTable />}>
        <p class="loading">Loading...</p>
      </Show>
    </div>
  );
}
