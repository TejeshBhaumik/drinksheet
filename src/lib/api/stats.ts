import type { UserStats } from "../types";
import { supabase } from "./client";
import { toUserStats } from "./mappers";

export async function getUserStats(userId: string): Promise<UserStats> {
  const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();
  if (error) throw error;
  return toUserStats(data);
}

export async function recomputeUserStats(userId: string): Promise<void> {
  const { error } = await supabase.rpc("recompute_user_stats", { target_user_id: userId });
  if (error) throw error;
}
