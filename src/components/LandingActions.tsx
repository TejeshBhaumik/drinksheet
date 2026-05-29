import { A } from "@solidjs/router";

export function LandingActions() {
  return (
    <div class="actions actions--row">
      <A href="/create" class="btn btn--primary">
        Create Event
      </A>
      <A href="/join" class="btn">
        Join Event
      </A>
    </div>
  );
}
