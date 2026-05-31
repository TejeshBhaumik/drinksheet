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
      <Show when={props.mode === "create"}>
        <div class="field">
          <label for="eventName">Event name</label>
          <input
            id="eventName"
            type="text"
            placeholder="Memorial Day Match"
            autocomplete="off"
            value={state.form.eventName}
            onInput={(e) => appStore.setFormField("eventName", e.currentTarget.value)}
          />
        </div>
      </Show>

      <Show when={props.mode === "join"}>
        <div class="field">
          <label for="eventCode">Event code</label>
          <input
            id="eventCode"
            type="text"
            placeholder="ABCD23"
            autocomplete="off"
            value={state.form.eventCode}
            onInput={(e) => appStore.setFormField("eventCode", e.currentTarget.value)}
          />
        </div>
      </Show>

      <div class="field">
        <label for="displayName">{isInvite() ? "Your event name" : "Display name"}</label>
        <input
          id="displayName"
          type="text"
          placeholder="Your name"
          autocomplete="name"
          value={state.form.displayName}
          onInput={(e) => appStore.setFormField("displayName", e.currentTarget.value)}
        />
      </div>

      {state.error && <div class="error">{state.error}</div>}

      <button type="submit" class="btn btn--primary" disabled={state.loading}>
        {state.loading ? "..." : props.mode === "create" ? "Create Event" : "Join Event"}
      </button>
    </form>
  );
}
