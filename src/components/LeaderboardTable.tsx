import { For, Show } from "solid-js";
import { appStore } from "../lib/store";
import { EditableCell } from "./EditableCell";

export function LeaderboardTable() {
  const { state, leaderboard } = appStore;

  return (
    <Show when={state.participants.length > 0} fallback={<p class="loading">No players yet.</p>}>
      <section class="scoreboard">
        <div class="podium">
          <For each={leaderboard().slice(0, 3)}>
            {(row) => (
              <div classList={{ "podium__slot": true, "podium__slot--first": row.rank === 1 }}>
                <span class="podium__rank">#{row.rank}</span>
                <strong>{row.displayName}</strong>
                <span>{row.score.toFixed(1)}</span>
              </div>
            )}
          </For>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th class="num">Beer</th>
                <th class="num">Seltzer</th>
                <th class="num">Wine</th>
                <th class="num">Liquor</th>
                <th class="num">Score</th>
              </tr>
            </thead>
            <tbody>
              <For each={leaderboard()}>
                {(row) => (
                  <tr classList={{ "row--self": row.userId === state.currentUser?.id }}>
                    <td class="rank">#{row.rank}</td>
                    <td>{row.displayName}</td>
                    <td class="metric-cell num">
                      <Show
                        when={row.userId === state.currentUser?.id && !state.event?.completedAt}
                        fallback={<span>{row.metrics.beer.toFixed(1)}</span>}
                      >
                        <EditableCell field="beer" value={row.metrics.beer} label="Beer" />
                      </Show>
                    </td>
                    <td class="metric-cell num">
                      <Show
                        when={row.userId === state.currentUser?.id && !state.event?.completedAt}
                        fallback={<span>{row.metrics.seltzer.toFixed(1)}</span>}
                      >
                        <EditableCell field="seltzer" value={row.metrics.seltzer} label="Seltzer" />
                      </Show>
                    </td>
                    <td class="metric-cell num">
                      <Show
                        when={row.userId === state.currentUser?.id && !state.event?.completedAt}
                        fallback={<span>{row.metrics.wine.toFixed(1)}</span>}
                      >
                        <EditableCell field="wine" value={row.metrics.wine} label="Wine" />
                      </Show>
                    </td>
                    <td class="metric-cell num">
                      <Show
                        when={row.userId === state.currentUser?.id && !state.event?.completedAt}
                        fallback={<span>{row.metrics.liquor.toFixed(1)}</span>}
                      >
                        <EditableCell field="liquor" value={row.metrics.liquor} label="Liquor" />
                      </Show>
                    </td>
                    <td class="num total">{row.score.toFixed(1)}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        <Show when={state.event?.completedAt}>
          <p class="complete-banner">Final results locked.</p>
        </Show>
      </section>
    </Show>
  );
}
