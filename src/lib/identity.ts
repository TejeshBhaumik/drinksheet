const TOKEN_KEY = "drinksheet_edit_token";

export function getEditToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setEditToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function generateEditToken(): string {
  return crypto.randomUUID();
}

export function canEditRow(
  row: { event_name: string; player_name: string; edit_token: string },
  eventName: string,
  playerName: string,
  token: string | null
): boolean {
  return (
    !!token &&
    token === row.edit_token &&
    row.event_name === eventName &&
    row.player_name === playerName
  );
}
