import { Show, onMount } from "solid-js";
import { LandingActions } from "../components/LandingActions";
import { RecentEvents } from "../components/RecentEvents";
import { appStore } from "../lib/store";
import { normalizeEventCode } from "../lib/types";

export function Landing() {
  const eventFromLink = () => {
    const event = new URLSearchParams(window.location.search).get("event");
    return event ? normalizeEventCode(event) : "";
  };

  onMount(() => {
    void appStore.loadRecentEvents();
    const event = eventFromLink();
    if (event) appStore.prefillEventCode(event);
  });

  return (
    <>
      <div class="card card--center">
        <div class="hero">
          <h1>Drinksheet</h1>
          <p>Track drinks together. No login required.</p>
          <Show when={eventFromLink()}>
            <p class="hero__invite">
              You were invited to <span class="event-code">{eventFromLink()}</span> — join below.
            </p>
          </Show>
        </div>
        <LandingActions />
      </div>
      <RecentEvents />
    </>
  );
}
