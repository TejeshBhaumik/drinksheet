import { Show, onCleanup, onMount } from "solid-js";
import { useParams } from "@solidjs/router";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { appStore } from "../lib/store";
import { normalizeEventCode } from "../lib/types";

export function EventPage() {
  const params = useParams();
  const { state } = appStore;

  onMount(() => {
    const eventName = normalizeEventCode(decodeURIComponent(params.eventName));
    void appStore.loadEvent(eventName);
    appStore.setupRealtime(eventName);
  });

  onCleanup(() => appStore.teardownRealtime());

  return (
    <>
      <h2 class="page-title">
        Event <span class="event-code">{state.eventName || params.eventName}</span>
      </h2>
      <p class="page-sub">Live leaderboard — edit your row inline.</p>

      <Show when={state.error}>
        <div class="error">{state.error}</div>
      </Show>

      <Show when={state.loading && state.rows.length === 0} fallback={<LeaderboardTable />}>
        <p class="loading">Loading...</p>
      </Show>
    </>
  );
}
