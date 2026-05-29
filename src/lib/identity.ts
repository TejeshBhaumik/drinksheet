const SESSION_KEY = "drinksheet_session";
const LEGACY_TOKEN_KEY = "drinksheet_edit_token";

export type PlayerSession = {
  event_name: string;
  player_name: string;
  edit_token: string;
};

export function getSession(): PlayerSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      const session = JSON.parse(raw) as PlayerSession;
      if (session.event_name && session.player_name) return session;
    } catch {
      /* fall through */
    }
  }
  return null;
}

export function getSessionForEvent(eventName: string): PlayerSession | null {
  const session = getSession();
  return session?.event_name === eventName ? session : null;
}

export function setSession(session: PlayerSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function generateEditToken(): string {
  return crypto.randomUUID();
}

export function verifySessionForRows(
  session: PlayerSession | null,
  rows: { player_name: string; edit_token: string }[]
): { playerName: string; editToken: string | null } {
  if (!session) return { playerName: "", editToken: null };

  const row = rows.find((r) => r.player_name === session.player_name);
  if (!row || !session.edit_token || row.edit_token !== session.edit_token) {
    return { playerName: session.player_name, editToken: null };
  }

  return { playerName: session.player_name, editToken: session.edit_token };
}

export function hasSessionForEvent(eventName: string): boolean {
  return getSessionForEvent(eventName) !== null;
}

export function canEditRow(
  row: { event_name: string; player_name: string; edit_token: string },
  eventName: string,
  playerName: string,
  token: string | null
): boolean {
  return (
    !!token &&
    !!playerName &&
    token === row.edit_token &&
    row.event_name === eventName &&
    row.player_name === playerName
  );
}
