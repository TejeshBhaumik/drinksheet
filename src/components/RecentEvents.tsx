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
    <section class="recent-events card">
      <div class="recent-events__header">
        <div>
          <p class="eyebrow">Activity</p>
          <h2 class="recent-events__title">Recent events</h2>
        </div>
        <p class="recent-events__lede">Jump back into a room or create a new one in a few seconds.</p>
      </div>
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
                    href={`/join?event=${encodeURIComponent(event.eventCode)}`}
                    class="recent-events__item"
                  >
                    <span class="recent-events__item-main">
                      <strong>{event.eventName}</strong>
                      <span class="event-code">{event.eventCode}</span>
                    </span>
                    <span class="recent-events__item-meta">
                      <span class="recent-events__arrow">Open</span>
                      <span class="recent-events__date">{formatWhen(event.createdAt)}</span>
                    </span>
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
