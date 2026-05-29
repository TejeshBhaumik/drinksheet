import { For, Show } from "solid-js";
import { canEditRow } from "../lib/identity";
import { appStore } from "../lib/store";
import { total } from "../lib/types";
import { EditableCell } from "./EditableCell";

export function LeaderboardTable() {
  const { state } = appStore;

  const sorted = () =>
    [...state.rows].sort((a, b) => total(b) - total(a) || a.player_name.localeCompare(b.player_name));

  return (
    <Show when={state.rows.length > 0} fallback={<p class="loading">No players yet.</p>}>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th class="num">Beer</th>
              <th class="num">Liquor</th>
              <th class="num">Wine</th>
              <th class="num">Total</th>
            </tr>
          </thead>
          <tbody>
            <For each={sorted()}>
              {(row) => {
                const editable = () =>
                  canEditRow(row, state.eventName, state.playerName, state.editToken);
                const isSelf = () => editable();

                return (
                  <tr classList={{ "row--self": isSelf() }}>
                    <td>{row.player_name}</td>
                    <td class="num">
                      <EditableCell
                        playerName={row.player_name}
                        field="beer"
                        value={row.beer}
                        editable={editable()}
                      />
                    </td>
                    <td class="num">
                      <EditableCell
                        playerName={row.player_name}
                        field="liquor"
                        value={row.liquor}
                        editable={editable()}
                      />
                    </td>
                    <td class="num">
                      <EditableCell
                        playerName={row.player_name}
                        field="wine"
                        value={row.wine}
                        editable={editable()}
                      />
                    </td>
                    <td class="num total">{total(row)}</td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>
    </Show>
  );
}
