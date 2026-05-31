import { Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { LandingActions } from "../components/LandingActions";
import { RecentEvents } from "../components/RecentEvents";
import { appStore } from "../lib/store";

export function Landing() {
  const navigate = useNavigate();
  const { state } = appStore;

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
          <p>Real-time competition tracking with live scores, event codes, and finish-line stats.</p>
          <Show when={!state.currentUser && !state.authLoading}>
            <button type="button" class="btn btn--primary hero__signin" onClick={() => void appStore.loginWithGoogle()}>
              Sign in with Google
            </button>
          </Show>
        </div>
        <LandingActions />
      </div>
      <RecentEvents />
    </>
  );
}
