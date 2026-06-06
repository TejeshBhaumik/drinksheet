import type { DrinkMetric } from "../lib/types";
import { MAX_METRIC, clampMetric } from "../lib/types";
import { appStore } from "../lib/store";

type Props = {
  field: DrinkMetric;
  label: string;
  value: number;
};

function nextValue(value: number, delta: number): number {
  return clampMetric(value + delta);
}

export function EditableCell(props: Props) {
  let pressTimer: number | undefined;
  let longPressed = false;

  function change(delta: number) {
    void appStore.updateMetric(props.field, nextValue(props.value, delta));
  }

  function startPress(delta: number) {
    longPressed = false;
    window.clearTimeout(pressTimer);
    pressTimer = window.setTimeout(() => {
      longPressed = true;
      change(delta * 2);
    }, 420);
  }

  function endPress(delta: number) {
    window.clearTimeout(pressTimer);
    if (!longPressed) change(delta);
  }

  return (
    <div class="metric-stepper metric-stepper--inline">
      <div class="metric-stepper__top">
        <span class="metric-stepper__label">{props.label}</span>
        <strong>{props.value.toFixed(1)}</strong>
      </div>
      <div class="metric-stepper__controls">
        <button
          type="button"
          class="cell-btn"
          aria-label={`Decrease ${props.label}`}
          disabled={props.value <= 0}
          onPointerDown={() => startPress(-0.5)}
          onPointerUp={() => endPress(-0.5)}
          onPointerLeave={() => window.clearTimeout(pressTimer)}
        >
          -
        </button>
        <button
          type="button"
          class="cell-btn cell-btn--plus"
          aria-label={`Increase ${props.label}`}
          disabled={props.value >= MAX_METRIC}
          onPointerDown={() => startPress(0.5)}
          onPointerUp={() => endPress(0.5)}
          onPointerLeave={() => window.clearTimeout(pressTimer)}
        >
          +
        </button>
      </div>
    </div>
  );
}
