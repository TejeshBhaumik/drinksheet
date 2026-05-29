export type MasterRow = {
  event_name: string;
  player_name: string;
  beer: number;
  wine: number;
  liquor: number;
  edit_token: string;
  created_at: string;
};

export type DrinkField = "beer" | "wine" | "liquor";

export type RecentEvent = {
  event_name: string;
  created_at: string;
};

export const MAX_DRINK = 30;

export function clampDrink(value: number): number {
  return Math.min(MAX_DRINK, Math.max(0, value));
}

export function total(row: Pick<MasterRow, "beer" | "wine" | "liquor">): number {
  return row.beer + row.wine + row.liquor;
}

export function normalizeEventCode(code: string): string {
  return code.trim().toUpperCase();
}

export function normalizePlayerName(name: string): string {
  return name.trim();
}

export function isValidEventCode(code: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(code.trim()) && code.trim().length > 0;
}

export function parseDrink(value: string): number | null {
  const n = Number(value);
  if (value === "" || Number.isNaN(n) || n < 0) return null;
  return clampDrink(n);
}
