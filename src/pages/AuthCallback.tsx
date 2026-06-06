import { createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { handleAuthCallback } from "../lib/api/auth";

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = createSignal("");

  onMount(() => {
    void (async () => {
      const url = new URL(window.location.href);
      const next = url.searchParams.get("next") ?? "/";
      try {
        await handleAuthCallback();
        navigate(next.startsWith("/") ? next : "/", { replace: true });
      } catch (error) {
        setError(error instanceof Error ? error.message : "Could not complete sign-in.");
        console.error("OAuth callback failed:", error);
      }
    })();
  });

  return (
    <div class="page-stack">
      <div class="card card--center">
        <Show
          when={!error()}
          fallback={
            <>
              <div class="eyebrow">Sign-in failed</div>
              <h2 class="page-title">Could not complete Google sign-in</h2>
              <p class="page-sub">{error()}</p>
              <a href="/" class="btn btn--primary">
                Back to home
              </a>
            </>
          }
        >
          <div class="eyebrow">Signing in</div>
          <h2 class="page-title">Completing Google sign-in</h2>
          <p class="page-sub">Please wait while Drinksheet finishes authentication.</p>
        </Show>
      </div>
    </div>
  );
}
