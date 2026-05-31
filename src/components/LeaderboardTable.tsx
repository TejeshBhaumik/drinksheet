import { For, Show } from "solid-js";
import { appStore } from "../lib/store";
import { METRIC_FIELDS } from "../lib/types";
import { EditableCell } from "./EditableCell";

function metricLabel(metric: string): string {
  return metric[0].toUpperCase() + metric.slice(1);
}

export function LeaderboardTable() {
  const { state, leaderboard } = appStore;

  const currentParticipant = () =>
    state.participants.find((participant) => participant.userId === state.currentUser?.id) ?? null;
  const editableParticipant = () => (state.event?.completedAt ? null : currentParticipant());

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
                <th class="num">Score</th>
              </tr>
            </thead>
            <tbody>
              <For each={leaderboard()}>
                {(row) => (
                  <tr classList={{ "row--self": row.userId === state.currentUser?.id }}>
                    <td class="rank">#{row.rank}</td>
                    <td>{row.displayName}</td>
                    <td class="num total">{row.score.toFixed(1)}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        <Show when={editableParticipant()}>
          {(participant) => (
            <div class="metric-panel">
              <div>
                <h3>Your metrics</h3>
                <p>Tap for 0.5. Press and hold for 1.0.</p>
              </div>
              <div class="metric-grid">
                <For each={METRIC_FIELDS}>
                  {(field) => (
                    <EditableCell
                      field={field}
                      value={participant().metrics[field]}
                      label={metricLabel(field)}
                    />
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>

        <Show when={state.event?.completedAt}>
          <p class="complete-banner">Final results locked.</p>
        </Show>
      </section>
    </Show>
  );
}
