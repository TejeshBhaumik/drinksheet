import { Show, onCleanup, onMount } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { ShareEventButton } from "../components/ShareEventButton";
import { hasSessionForEvent } from "../lib/identity";
import { appStore } from "../lib/store";
import { normalizeEventCode } from "../lib/types";

export function EventPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = appStore;

  onMount(() => {
    const eventName = normalizeEventCode(decodeURIComponent(params.eventName));

    if (!hasSessionForEvent(eventName)) {
      navigate(`/join?event=${encodeURIComponent(eventName)}`, { replace: true });
      return;
    }

    void appStore.loadEvent(eventName);
    appStore.setupRealtime(eventName);
  });

  onCleanup(() => appStore.teardownRealtime());

  return (
    <>
      <div class="event-header">
        <div>
          <h2 class="page-title">
            Event <span class="event-code">{state.eventName || params.eventName}</span>
          </h2>
          <p class="page-sub">Live leaderboard — edit your row inline.</p>
        </div>
        <ShareEventButton />
      </div>

      <Show when={state.error}>
        <div class="error">{state.error}</div>
      </Show>

      <Show when={state.loading && state.rows.length === 0} fallback={<LeaderboardTable />}>
        <p class="loading">Loading...</p>
      </Show>
    </>
  );
}
