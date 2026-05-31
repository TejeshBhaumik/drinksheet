import type { AppUser } from "../types";
import { supabase } from "./client";
import { toUser } from "./mappers";

export async function getUser(userId: string): Promise<AppUser> {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
  if (error) throw error;
  return toUser(data);
}

export async function upsertUser(input: {
  userId: string;
  email: string | null;
  displayName: string;
}): Promise<AppUser> {
  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: input.userId,
      email: input.email,
      display_name: input.displayName,
    })
    .select()
    .single();

  if (error) throw error;
  return toUser(data);
}

export async function updateDisplayName(userId: string, name: string): Promise<void> {
  const { error } = await supabase.from("users").update({ display_name: name }).eq("id", userId);
  if (error) throw error;
}

export async function updatePhoneNumber(userId: string, number: string): Promise<void> {
  const { error } = await supabase.from("users").update({ phone_number: number }).eq("id", userId);
  if (error) throw error;
}
