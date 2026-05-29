const SESSION_KEY = "drinksheet_session";
const LEGACY_TOKEN_KEY = "drinksheet_edit_token";

export type PlayerSession = {
  event_name: string;
  player_name: string;
  edit_token: string;
};

export type PlayerIdentity = {
  playerName: string;
  editToken: string | null;
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

function getLegacyToken(): string | null {
  return localStorage.getItem(LEGACY_TOKEN_KEY);
}

function tokenMatchesRow(
  row: { player_name: string; edit_token: string },
  token: string | null | undefined
): boolean {
  return !!token && token === row.edit_token;
}

export function resolveEditTokenForRow(
  eventName: string,
  row: { player_name: string; edit_token: string }
): string | null {
  const session = getSessionForEvent(eventName);
  if (session?.player_name === row.player_name && tokenMatchesRow(row, session.edit_token)) {
    return session.edit_token;
  }

  const legacy = getLegacyToken();
  if (tokenMatchesRow(row, legacy)) return legacy;

  const anySession = getSession();
  if (
    anySession?.player_name === row.player_name &&
    tokenMatchesRow(row, anySession.edit_token)
  ) {
    return anySession.edit_token;
  }

  return null;
}

export function resolveIdentityForEvent(
  eventName: string,
  rows: { player_name: string; edit_token: string }[]
): PlayerIdentity {
  const session = getSessionForEvent(eventName);

  if (session) {
    const row = rows.find((r) => r.player_name === session.player_name);
    const editToken = row ? resolveEditTokenForRow(eventName, row) : null;
    if (editToken) {
      setSession({
        event_name: eventName,
        player_name: session.player_name,
        edit_token: editToken,
      });
      return { playerName: session.player_name, editToken };
    }
    return { playerName: session.player_name, editToken: null };
  }

  const legacy = getLegacyToken();
  if (legacy) {
    const row = rows.find((r) => r.edit_token === legacy);
    if (row) {
      setSession({
        event_name: eventName,
        player_name: row.player_name,
        edit_token: legacy,
      });
      return { playerName: row.player_name, editToken: legacy };
    }
  }

  return { playerName: "", editToken: null };
}

export function verifySessionForRows(
  session: PlayerSession | null,
  rows: { player_name: string; edit_token: string }[]
): PlayerIdentity {
  if (!session) return { playerName: "", editToken: null };

  const row = rows.find((r) => r.player_name === session.player_name);
  if (!row) return { playerName: session.player_name, editToken: null };

  const editToken = resolveEditTokenForRow(session.event_name, row);
  return { playerName: session.player_name, editToken };
}

export function hasSessionForEvent(eventName: string): boolean {
  if (getSessionForEvent(eventName)) return true;
  return !!getLegacyToken();
}

export function canAccessEvent(eventName: string, rows: { edit_token: string }[]): boolean {
  if (getSessionForEvent(eventName)) return true;
  const legacy = getLegacyToken();
  return !!legacy && rows.some((r) => r.edit_token === legacy);
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
