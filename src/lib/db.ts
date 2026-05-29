import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import type { DrinkField, MasterRow } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export async function createEventRow(
  eventName: string,
  playerName: string,
  editToken: string
): Promise<MasterRow> {
  const { data, error } = await supabase
    .from("master")
    .insert({
      event_name: eventName,
      player_name: playerName,
      beer: 0,
      wine: 0,
      liquor: 0,
      edit_token: editToken,
    })
    .select()
    .single();

  if (error) throw error;
  return data as MasterRow;
}

export async function eventExists(eventName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("master")
    .select("event_name")
    .eq("event_name", eventName)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function joinEventRow(
  eventName: string,
  playerName: string,
  editToken: string
): Promise<MasterRow> {
  const { data, error } = await supabase
    .from("master")
    .insert({
      event_name: eventName,
      player_name: playerName,
      beer: 0,
      wine: 0,
      liquor: 0,
      edit_token: editToken,
    })
    .select()
    .single();

  if (error) throw error;
  return data as MasterRow;
}

export async function fetchEventRows(eventName: string): Promise<MasterRow[]> {
  const { data, error } = await supabase
    .from("master")
    .select("*")
    .eq("event_name", eventName)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MasterRow[];
}

export async function updateDrink(
  eventName: string,
  playerName: string,
  field: DrinkField,
  value: number,
  editToken: string
): Promise<void> {
  const { error } = await supabase
    .from("master")
    .update({ [field]: value })
    .eq("event_name", eventName)
    .eq("player_name", playerName)
    .eq("edit_token", editToken);

  if (error) throw error;
}

export function subscribeToEvent(
  eventName: string,
  onChange: () => void
): RealtimeChannel {
  return supabase
    .channel(`event:${eventName}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "master",
        filter: `event_name=eq.${eventName}`,
      },
      () => onChange()
    )
    .subscribe();
}
