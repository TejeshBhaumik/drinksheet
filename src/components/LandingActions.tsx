import { A } from "@solidjs/router";
import { appStore } from "../lib/store";

export function LandingActions() {
  const { state } = appStore;

  return (
    <div class="actions actions--row landing-actions">
      {state.currentUser ? (
        <>
          <A href="/create" class="btn btn--primary">
            Create Event
          </A>
          <A href="/join" class="btn">
            Join Event
          </A>
        </>
      ) : (
        <p class="page-sub landing-actions__note">
          Sign in using the header button to create or join an event.
        </p>
      )}
    </div>
  );
}
