import { supabase } from "./client";

export async function sendEventSummary(input: { eventId: string }): Promise<void> {
  const { error } = await supabase.functions.invoke("send-event-summary", {
    body: { eventId: input.eventId },
  });
  if (error) throw error;
}
