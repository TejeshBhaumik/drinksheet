import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { EventForm } from "../components/EventForm";
import { appStore } from "../lib/store";

export function CreateEvent() {
  const navigate = useNavigate();

  onMount(() => appStore.resetForm());

  async function handleSubmit() {
    const path = await appStore.createEvent();
    if (path) navigate(path);
  }

  return (
    <>
      <a href="/" class="back-link">
        ← Back
      </a>
      <div class="card">
        <h2 class="page-title">Create Event</h2>
        <p class="page-sub">Pick a code and your player name to start.</p>
        <EventForm mode="create" onSubmit={handleSubmit} />
      </div>
    </>
  );
}
