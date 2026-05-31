import type { LeaderboardRow } from "../types";
import { computeLeaderboard } from "../logic/scoring";
import { getParticipants } from "./participants";

export async function getLeaderboard(eventId: string): Promise<LeaderboardRow[]> {
  return computeLeaderboard(await getParticipants(eventId));
}
