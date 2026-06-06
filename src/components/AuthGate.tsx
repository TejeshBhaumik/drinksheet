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
          <button type="button" class="btn btn--primary" onClick={() => void appStore.loginWithGoogle()}>
            Sign in with Google
          </button>
        </div>
      }
    >
      {props.children}
    </Show>
  );
}
