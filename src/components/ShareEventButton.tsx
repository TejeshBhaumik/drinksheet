import { createSignal, Show } from "solid-js";
import { appStore } from "../lib/store";
import { buildInviteLink, copyInviteLink } from "../lib/share";

export function ShareEventButton() {
  const { state } = appStore;
  const [copied, setCopied] = createSignal(false);

  async function handleShare() {
    const participant = state.participants.find((row) => row.userId === state.currentUser?.id);
    if (!state.event || !participant) return;

    const link = buildInviteLink(state.event.eventCode, participant.displayName);
    const ok = await copyInviteLink(link);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Show when={state.event && state.currentUser}>
      <button type="button" class="btn btn--ghost share-btn" onClick={handleShare}>
        {copied() ? "Link copied!" : "Share event link"}
      </button>
    </Show>
  );
}
