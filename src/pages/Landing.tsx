import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { LandingActions } from "../components/LandingActions";
import { RecentEvents } from "../components/RecentEvents";
import { appStore } from "../lib/store";

export function Landing() {
  const navigate = useNavigate();

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
      <div class="hero-shell card card--center">
        <div class="hero">
          <div class="eyebrow">Live competition tracking</div>
          <h1>Drinksheet</h1>
          <p>
            A cleaner way to run fast-moving events: create a room, share a code, and watch the board update in
            real time.
          </p>

          <div class="hero__stats" aria-label="Product highlights">
            <div class="hero__stat">
              <strong>Real time</strong>
              <span>Leaderboard updates as scores change.</span>
            </div>
            <div class="hero__stat">
              <strong>Event codes</strong>
              <span>Share a short invite instead of links.</span>
            </div>
            <div class="hero__stat">
              <strong>Clean finish</strong>
              <span>Lock results and keep the final board visible.</span>
            </div>
          </div>
        </div>

        <div class="hero__panel">
          <div class="hero__panel-card">
            <span class="hero__panel-label">Quick start</span>
            <h2>Open the room, then invite everyone else.</h2>
            <p>Create an event or join a live one with a code. The layout stays focused on the board, not the UI.</p>
            <LandingActions />
          </div>
          <div class="hero__panel-note">
            <span class="event-code">Instant sync</span>
            <p>Designed for tablets, laptops, and quick score updates on the fly.</p>
          </div>
        </div>
      </div>
      <RecentEvents />
    </>
  );
}
