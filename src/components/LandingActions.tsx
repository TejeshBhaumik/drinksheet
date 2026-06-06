import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { appStore } from "../lib/store";

export function LandingActions() {
  const { state } = appStore;

  return (
    <div class="actions actions--row landing-actions">
      <Show
        when={state.currentUser}
        fallback={
          <button type="button" class="btn btn--primary" onClick={() => void appStore.loginWithGoogle()}>
            Sign in with Google
          </button>
        }
      >
        <>
          <A href="/create" class="btn btn--primary">
            Create Event
          </A>
          <A href="/join" class="btn">
            Join Event
          </A>
        </>
      </Show>
    </div>
  );
}
