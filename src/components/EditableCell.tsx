import type { DrinkField } from "../lib/types";
import { clampDrink, MAX_DRINK } from "../lib/types";
import { appStore } from "../lib/store";

type Props = {
  playerName: string;
  field: DrinkField;
  value: number;
  editable: boolean;
};

function adjust(value: number, delta: number): number {
  return clampDrink(value + delta);
}

export function EditableCell(props: Props) {
  if (!props.editable) {
    return <span class="cell-static">{props.value}</span>;
  }

  function change(delta: number) {
    void appStore.updateCell(props.playerName, props.field, adjust(props.value, delta));
  }

  return (
    <div class="cell-counter">
      <button
        type="button"
        class="cell-btn"
        aria-label={`Decrease ${props.field}`}
        disabled={props.value <= 0}
        onClick={() => change(-1)}
      >
        −
      </button>
      <span class="cell-value">{props.value}</span>
      <button
        type="button"
        class="cell-btn"
        aria-label={`Increase ${props.field}`}
        disabled={props.value >= MAX_DRINK}
        onClick={() => change(1)}
      >
        +
      </button>
    </div>
  );
}
