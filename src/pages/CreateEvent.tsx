import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { AuthGate } from "../components/AuthGate";
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
    <div class="page-stack">
      <a href="/" class="back-link">
        Back
      </a>
      <AuthGate title="Create Event" description="Sign in to use an existing account or sign up to create a new one, then create a shareable code.">
        <div class="card">
          <h2 class="page-title">Create Event</h2>
          <p class="page-sub">Name the match. Drinksheet generates a shareable event code.</p>
          <EventForm mode="create" onSubmit={handleSubmit} />
        </div>
      </AuthGate>
    </div>
  );
}
