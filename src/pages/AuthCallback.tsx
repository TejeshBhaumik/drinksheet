import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { handleAuthCallback } from "../lib/api/auth";

export function AuthCallback() {
  const navigate = useNavigate();

  onMount(() => {
    void (async () => {
      const url = new URL(window.location.href);
      const next = url.searchParams.get("next") ?? "/";
      try {
        await handleAuthCallback();
      } finally {
        navigate(next.startsWith("/") ? next : "/", { replace: true });
      }
    })();
  });

  return (
    <div class="page-stack">
      <div class="card card--center">
        <div class="eyebrow">Signing in</div>
        <h2 class="page-title">Completing Google sign-in</h2>
        <p class="page-sub">Please wait while Drinksheet finishes authentication.</p>
      </div>
    </div>
  );
}
