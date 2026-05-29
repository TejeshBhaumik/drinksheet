import type { DrinkField } from "../lib/types";
import { parseDrink } from "../lib/types";
import { appStore } from "../lib/store";

type Props = {
  playerName: string;
  field: DrinkField;
  value: number;
  editable: boolean;
};

export function EditableCell(props: Props) {
  if (!props.editable) {
    return <span class="cell-static">{props.value}</span>;
  }

  return (
    <input
      class="cell-input"
      type="number"
      min="0"
      step="any"
      value={props.value}
      onChange={(e) => {
        const parsed = parseDrink(e.currentTarget.value);
        if (parsed !== null) {
          void appStore.updateCell(props.playerName, props.field, parsed);
        }
      }}
    />
  );
}
