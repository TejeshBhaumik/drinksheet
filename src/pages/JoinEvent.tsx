import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { EventForm } from "../components/EventForm";
import { appStore } from "../lib/store";

export function JoinEvent() {
  const navigate = useNavigate();

  onMount(() => appStore.resetForm());

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
        <h2 class="page-title">Join Event</h2>
        <p class="page-sub">Enter the event code and your name. Returning? Use the same name to open your board.</p>
        <EventForm mode="join" onSubmit={handleSubmit} />
      </div>
    </>
  );
}
