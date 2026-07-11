// Supabase connection config.
//
// The URL and anon/publishable key are PUBLIC by design — they are embedded in
// the client bundle and shipped to every browser. Access is protected by
// Row-Level Security, not by hiding these values. We provide them as fallback
// defaults so the app works without extra Vercel setup; environment variables
// (if set) always take precedence.

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://pdhbuecydkuhfgkruevk.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_qfebBHjhnVneWdihiVc66g_ClrZ-sRk";

export const SUPABASE_CONFIGURED = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
