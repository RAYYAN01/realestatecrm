"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_CONFIGURED } from "./config";

/** Browser Supabase client. */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/** True when the app has Supabase credentials (always true — see config.ts). */
export const isSupabaseConfigured = SUPABASE_CONFIGURED;
