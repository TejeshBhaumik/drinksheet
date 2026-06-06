import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./client";

function getRedirectUrl(): string {
  const configured = import.meta.env.VITE_SUPABASE_REDIRECT_URL;
  if (configured) {
    try {
      const url = new URL(configured);
      const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if (!isLocalHost || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return configured.replace(/\/$/, "");
      }
    } catch {
      // Ignore invalid config and fall through to the current origin.
    }
  }
  return window.location.origin;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function signInWithGoogle(): Promise<void> {
  const next = `${window.location.pathname}${window.location.search}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getRedirectUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) throw error;
}

export async function handleAuthCallback(): Promise<void> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) return;

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;

  window.history.replaceState({}, document.title, next.startsWith("/") ? next : "/");
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
