import type { Link } from "../types";
import { supabase } from "./client";

function toLink(row: any): Link {
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    url: row.url,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export async function getEventLinks(eventId: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toLink);
}

export async function addLink(input: {
  eventId: string;
  title: string;
  url: string;
  createdBy: string;
}): Promise<void> {
  const { error } = await supabase.from("links").insert({
    event_id: input.eventId,
    title: input.title,
    url: input.url,
    created_by: input.createdBy,
  });
  if (error) throw error;
}
