import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./client";

export function useLeaderboardStream(eventId: string, onChange: () => void): RealtimeChannel {
  return supabase
    .channel(`leaderboard:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "participants",
        filter: `event_id=eq.${eventId}`,
      },
      () => onChange()
    )
    .subscribe();
}
