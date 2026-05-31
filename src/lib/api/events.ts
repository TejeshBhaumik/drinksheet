import type { Event } from "../types";
import { normalizeEventCode } from "../types";
import { supabase } from "./client";
import { toEvent, toRecentEvent } from "./mappers";
import { createParticipant } from "./participants";

function generateEventCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export async function createEvent(input: {
  eventName: string;
  createdBy: string;
  displayName?: string;
}): Promise<Event> {
  const eventCode = generateEventCode();
  const { data, error } = await supabase
    .from("events")
    .insert({
      event_name: input.eventName.trim(),
      event_code: eventCode,
      created_by: input.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  const event = toEvent(data);

  await createParticipant({
    eventId: event.id,
    userId: input.createdBy,
    displayName: input.displayName ?? "Player",
  });

  return event;
}

export async function getEvent(eventCode: string): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_code", normalizeEventCode(eventCode))
    .single();

  if (error) throw error;
  return toEvent(data);
}

export async function joinEvent(input: {
  eventCode: string;
  userId: string;
  displayName: string;
}): Promise<void> {
  const event = await getEvent(input.eventCode);
  await createParticipant({
    eventId: event.id,
    userId: input.userId,
    displayName: input.displayName,
  });
}

export async function completeEvent(eventId: string): Promise<void> {
  const { error } = await supabase.rpc("complete_event", { target_event_id: eventId });
  if (error) throw error;
}

export async function getRecentEvents(limit = 5) {
  const { data, error } = await supabase
    .from("events")
    .select("event_name,event_code,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(toRecentEvent);
}
