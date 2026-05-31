import { normalizeDisplayName, normalizeEventCode } from "./types";

export function buildInviteLink(eventCode: string, displayName: string): string {
  const params = new URLSearchParams({
    event: normalizeEventCode(eventCode),
    from: normalizeDisplayName(displayName),
  });
  return `${window.location.origin}/join?${params.toString()}`;
}

export function parseInviteParams(search: string): {
  eventName: string;
  invitedBy: string;
} {
  const params = new URLSearchParams(search);
  const eventName = params.get("event") ? normalizeEventCode(params.get("event")!) : "";
  const invitedBy = params.get("from") ? normalizeDisplayName(params.get("from")!) : "";
  return { eventName, invitedBy };
}

export async function copyInviteLink(link: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch {
    return false;
  }
}
