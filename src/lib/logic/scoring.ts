import type { LeaderboardRow, Metrics, Participant, UserStats } from "../types";
import { coerceMetrics } from "../types";

export function calculateScore(metrics: Partial<Metrics>): number {
  const safe = coerceMetrics(metrics);
  return safe.beer + safe.seltzer + safe.wine + safe.liquor * 1.25;
}

export function computeLeaderboard(participants: Participant[]): LeaderboardRow[] {
  const enriched = participants.map((participant) => ({
    ...participant,
    score: calculateScore(participant.metrics),
    rank: 0,
  }));

  enriched.sort(
    (a, b) => b.score - a.score || a.displayName.localeCompare(b.displayName)
  );

  return enriched.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function computeEventStats(participants: Participant[]) {
  const leaderboard = computeLeaderboard(participants);
  return {
    participantCount: participants.length,
    winningScore: leaderboard[0]?.score ?? 0,
    leader: leaderboard[0] ?? null,
  };
}

export function computeUserStats(rows: Array<{ userId: string; rank: number; score: number }>): UserStats {
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const eventsPlayed = rows.length;

  return {
    userId: rows[0]?.userId ?? "",
    eventsPlayed,
    wins: rows.filter((row) => row.rank === 1).length,
    totalScore,
    averageScore: eventsPlayed === 0 ? 0 : totalScore / eventsPlayed,
    updatedAt: new Date().toISOString(),
  };
}
