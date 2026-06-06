import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Missing VITE_SUPABASE_URL and either VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY in .env.local");
}

export const supabase = createClient(url, key);
