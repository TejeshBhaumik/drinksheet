import { For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { appStore } from "../lib/store";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function RecentEvents() {
  const { state } = appStore;

  return (
    <section class="recent-events">
      <h2 class="recent-events__title">Recent events</h2>
      <Show
        when={!state.recentEventsLoading}
        fallback={<p class="recent-events__empty">Loading events...</p>}
      >
        <Show
          when={state.recentEvents.length > 0}
          fallback={<p class="recent-events__empty">No events yet. Create one to get started.</p>}
        >
          <ul class="recent-events__list">
            <For each={state.recentEvents}>
              {(event) => (
                <li>
                  <A
                    href={`/join?event=${encodeURIComponent(event.event_name)}`}
                    class="recent-events__item"
                  >
                    <span class="event-code">{event.event_name}</span>
                    <span class="recent-events__date">{formatWhen(event.created_at)}</span>
                  </A>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </section>
  );
}
