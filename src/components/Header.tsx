import { A } from "@solidjs/router";
import { Show, onMount } from "solid-js";
import type { ParentProps } from "solid-js";
import { appStore } from "../lib/store";

export function Header() {
  const { state } = appStore;

  onMount(() => {
    void appStore.loadAuth();
  });

  return (
    <header class="header">
      <div class="container header__inner">
        <A href="/" class="logo">
          Drinksheet
        </A>
        <div class="header__actions">
          <Show
            when={state.currentUser}
            fallback={
              <button
                type="button"
                class="btn btn--primary btn--sm"
                onClick={() => void appStore.loginWithPhone()}
              >
                Sign in
              </button>
            }
          >
            {(user) => (
              <>
                <span class="header__user">{user().displayName}</span>
                <button type="button" class="btn btn--ghost btn--sm" onClick={() => void appStore.logout()}>
                  Sign out
                </button>
              </>
            )}
          </Show>
        </div>
      </div>
    </header>
  );
}

export function Layout(props: ParentProps) {
  const { state } = appStore;

  return (
    <div class="app">
      <Header />
      <Show when={state.notice}>
        <div class="notice-backdrop" role="presentation">
          <div class="notice" role="status" aria-live="polite">
            <div>
              <div class="eyebrow">Sign-in code</div>
              <p>{state.notice}</p>
            </div>
            <button type="button" class="btn btn--primary" onClick={() => appStore.clearNotice()}>
              OK
            </button>
          </div>
        </div>
      </Show>
      <main class="container">{props.children}</main>
    </div>
  );
}
