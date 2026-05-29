import { Show, onMount } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { LandingActions } from "../components/LandingActions";
import { RecentEvents } from "../components/RecentEvents";
import { getSession } from "../lib/identity";
import { appStore } from "../lib/store";

export function Landing() {
  const navigate = useNavigate();
  const savedSession = () => getSession();

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("event")) {
      navigate(`/join?${params.toString()}`, { replace: true });
      return;
    }
    void appStore.loadRecentEvents();
  });

  return (
    <>
      <div class="card card--center">
        <div class="hero">
          <h1>Drinksheet</h1>
          <p>Track drinks together. No login required.</p>
          <Show when={savedSession()}>
            {(session) => (
              <p class="hero__invite">
                Welcome back, {session().player_name} —{" "}
                <A href={`/event/${encodeURIComponent(session().event_name)}`}>
                  return to {session().event_name}
                </A>
              </p>
            )}
          </Show>
        </div>
        <LandingActions />
      </div>
      <RecentEvents />
    </>
  );
}
