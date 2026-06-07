import type { ParentProps } from "solid-js";
import { Show } from "solid-js";
import { appStore } from "../lib/store";

type Props = ParentProps & {
  title: string;
  description: string;
};

export function AuthGate(props: Props) {
  const { state } = appStore;

  return (
    <Show
      when={state.currentUser}
      fallback={
        <div class="card auth-gate">
          <div>
            <div class="eyebrow">Sign in required</div>
            <h2 class="page-title">{props.title}</h2>
            <p class="page-sub">{props.description}</p>
          </div>
          <div class="auth-gate__actions">
            <button type="button" class="btn btn--ghost" onClick={() => void appStore.loginWithEmail()}>
              Email
            </button>
            <button type="button" class="btn btn--primary" onClick={() => void appStore.loginWithGoogle()}>
              Google
            </button>
          </div>
        </div>
      }
    >
      {props.children}
    </Show>
  );
}
