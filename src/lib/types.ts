export type DrinkMetric = "beer" | "seltzer" | "wine" | "liquor";

export type Metrics = Record<DrinkMetric, number>;

export type AppUser = {
  id: string;
  displayName: string;
  phoneNumber: string | null;
  email: string | null;
};

export type Event = {
  id: string;
  eventName: string;
  eventCode: string;
  createdBy: string;
  completedAt: string | null;
  createdAt: string;
};

export type Participant = {
  id: string;
  eventId: string;
  userId: string;
  displayName: string;
  metrics: Metrics;
  createdAt: string;
  updatedAt: string;
};

export type LeaderboardRow = Participant & {
  score: number;
  rank: number;
};

export type UserStats = {
  userId: string;
  eventsPlayed: number;
  wins: number;
  totalScore: number;
  averageScore: number;
  updatedAt: string;
};

export type Link = {
  id: string;
  eventId: string;
  title: string;
  url: string;
  createdBy: string;
  createdAt: string;
};

export type RecentEvent = Pick<Event, "eventName" | "eventCode" | "createdAt">;

export const METRIC_FIELDS: DrinkMetric[] = ["beer", "seltzer", "wine", "liquor"];

export const EMPTY_METRICS: Metrics = {
  beer: 0,
  seltzer: 0,
  wine: 0,
  liquor: 0,
};

export const MAX_METRIC = 30;

export function clampMetric(value: number): number {
  return Math.min(MAX_METRIC, Math.max(0, value));
}

export function normalizeEventCode(code: string): string {
  return code.trim().toUpperCase();
}

export function normalizeDisplayName(name: string): string {
  return name.trim();
}

export function isValidEventCode(code: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(code.trim()) && code.trim().length > 0;
}

export function coerceMetrics(metrics: Partial<Record<string, unknown>> | null | undefined): Metrics {
  return {
    beer: clampMetric(Number(metrics?.beer ?? 0)),
    seltzer: clampMetric(Number(metrics?.seltzer ?? 0)),
    wine: clampMetric(Number(metrics?.wine ?? 0)),
    liquor: clampMetric(Number(metrics?.liquor ?? 0)),
  };
}
