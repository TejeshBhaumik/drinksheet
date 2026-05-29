import { Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { EventForm } from "../components/EventForm";
import { parseInviteParams } from "../lib/share";
import { appStore } from "../lib/store";

export function JoinEvent() {
  const navigate = useNavigate();

  const invite = () => parseInviteParams(window.location.search);
  const isInvite = () => !!invite().eventName && !!invite().invitedBy;

  onMount(() => {
    appStore.resetForm();
    const { eventName } = invite();
    if (eventName) appStore.prefillEventCode(eventName);
  });

  async function handleSubmit() {
    const path = await appStore.joinEvent();
    if (path) navigate(path);
  }

  return (
    <>
      <a href="/" class="back-link">
        ← Back
      </a>
      <div class="card">
        <Show
          when={isInvite()}
          fallback={
            <>
              <h2 class="page-title">Join Event</h2>
              <p class="page-sub">
                Enter the event code and your name. Returning? Use the same name to open your board.
              </p>
            </>
          }
        >
          <p class="invite-banner">
            <strong>{invite().invitedBy}</strong> invited you to{" "}
            <span class="event-code">{invite().eventName}</span>
          </p>
          <p class="page-sub">Enter your name to join.</p>
        </Show>
        <EventForm mode={isInvite() ? "invite" : "join"} onSubmit={handleSubmit} />
      </div>
    </>
  );
}
