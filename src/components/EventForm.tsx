import { appStore } from "../lib/store";

type Props = {
  mode: "create" | "join";
  onSubmit: () => void;
};

export function EventForm(props: Props) {
  const { state } = appStore;

  return (
    <form
      class="form"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit();
      }}
    >
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

      <div class="field">
        <label for="playerName">Player Name</label>
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
