import type { AppUser, Event, Metrics, Participant, RecentEvent, UserStats } from "../types";
import { coerceMetrics } from "../types";

export function toUser(row: any): AppUser {
  return {
    id: row.id,
    displayName: row.display_name ?? "",
    phoneNumber: row.phone_number ?? null,
    email: row.email ?? null,
  };
}

export function toEvent(row: any): Event {
  return {
    id: row.id,
    eventName: row.event_name,
    eventCode: row.event_code,
    createdBy: row.created_by,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
  };
}

export function toRecentEvent(row: any): RecentEvent {
  return {
    eventName: row.event_name,
    eventCode: row.event_code,
    createdAt: row.created_at,
  };
}

export function toParticipant(row: any): Participant {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    displayName: row.display_name,
    metrics: coerceMetrics(row.metrics as Partial<Metrics>),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toUserStats(row: any): UserStats {
  return {
    userId: row.user_id,
    eventsPlayed: row.events_played ?? 0,
    wins: row.wins ?? 0,
    totalScore: Number(row.total_score ?? 0),
    averageScore: Number(row.average_score ?? 0),
    updatedAt: row.updated_at,
  };
}
