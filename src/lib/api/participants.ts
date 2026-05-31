import type { Metrics, Participant } from "../types";
import { EMPTY_METRICS, coerceMetrics } from "../types";
import { supabase } from "./client";
import { toParticipant } from "./mappers";

export async function getParticipants(eventId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toParticipant);
}

export async function getParticipant(eventId: string, userId: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? toParticipant(data) : null;
}

export async function updateParticipantMetrics(input: {
  eventId: string;
  userId: string;
  metrics: Record<string, number>;
}): Promise<void> {
  const { error } = await supabase
    .from("participants")
    .update({ metrics: coerceMetrics(input.metrics as Partial<Metrics>) })
    .eq("event_id", input.eventId)
    .eq("user_id", input.userId);

  if (error) throw error;
}

export async function createParticipant(input: {
  eventId: string;
  userId: string;
  displayName: string;
}): Promise<void> {
  const { error } = await supabase.from("participants").upsert(
    {
      event_id: input.eventId,
      user_id: input.userId,
      display_name: input.displayName,
      metrics: EMPTY_METRICS,
    },
    { onConflict: "event_id,user_id" }
  );

  if (error) throw error;
}
