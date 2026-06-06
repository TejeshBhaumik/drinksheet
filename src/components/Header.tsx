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
              <button type="button" class="btn btn--ghost btn--sm" onClick={() => void appStore.loginWithGoogle()}>
                Sign in with Google
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
  return (
    <div class="app">
      <Header />
      <main class="container">{props.children}</main>
    </div>
  );
}
