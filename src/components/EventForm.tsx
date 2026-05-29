import { Show } from "solid-js";
import { appStore } from "../lib/store";

type Props = {
  mode: "create" | "join" | "invite";
  onSubmit: () => void;
};

export function EventForm(props: Props) {
  const { state } = appStore;
  const isInvite = () => props.mode === "invite";

  return (
    <form
      class="form"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit();
      }}
    >
      <Show when={!isInvite()}>
        <div class="field">
          <label for="eventCode">Event Code</label>
          <input
            id="eventCode"
            type="text"
            placeholder="VEGAS2026"
            autocomplete="off"
            value={state.form.eventCode}
            onInput={(e) => appStore.setFormField("eventCode", e.currentTarget.value)}
          />
        </div>
      </Show>

      <div class="field">
        <label for="playerName">{isInvite() ? "Your name" : "Player Name"}</label>
        <input
          id="playerName"
          type="text"
          placeholder="Your name"
          autocomplete="name"
          value={state.form.playerName}
          onInput={(e) => appStore.setFormField("playerName", e.currentTarget.value)}
        />
      </div>

      {state.error && <div class="error">{state.error}</div>}

      <button type="submit" class="btn btn--primary" disabled={state.loading}>
        {state.loading ? "..." : props.mode === "create" ? "Create Event" : "Join Event"}
      </button>
    </form>
  );
}
