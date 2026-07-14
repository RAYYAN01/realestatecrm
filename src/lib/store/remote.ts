"use client";

// Flexible remote persistence for the client stores.
//
// Each store keeps working exactly as before against localStorage. On top of
// that, when Supabase is configured AND the visitor is signed in, we mirror the
// store's JSON snapshot to a per-user `crm_state` row so data survives a cache
// clear and syncs across devices. Everything here degrades gracefully:
//   - not configured / signed out / offline  → silent no-op, localStorage wins
//   - configured + signed in                 → server becomes the source of truth
//
// This is intentionally best-effort: we never throw into the UI. See
// [[project-crm-phase1]] for the wider migration context.

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const TABLE = "crm_state";
const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();
const PUSH_DEBOUNCE_MS = 700;

/** True only in a browser with Supabase credentials present. */
function canSync() {
  return isSupabaseConfigured && typeof window !== "undefined";
}

/** Read a store's snapshot from the server. Returns null when unavailable. */
export async function fetchRemote<T>(key: string): Promise<T | null> {
  if (!canSync()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("user_id", user.id)
      .eq("key", key)
      .maybeSingle();
    if (error) return null;
    return (data?.value as T) ?? null;
  } catch {
    return null;
  }
}

/** Persist a store's snapshot to the server (debounced, fire-and-forget). */
export function pushRemote<T>(key: string, value: T) {
  if (!canSync()) return;
  const existing = pushTimers.get(key);
  if (existing) clearTimeout(existing);
  pushTimers.set(
    key,
    setTimeout(async () => {
      pushTimers.delete(key);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from(TABLE).upsert(
          {
            user_id: user.id,
            key,
            value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,key" }
        );
      } catch {
        // best-effort; localStorage still holds the data
      }
    }, PUSH_DEBOUNCE_MS)
  );
}

/**
 * Hydrate a store from the server once, after localStorage.
 *
 * - If the server has a snapshot, apply it (server wins across devices).
 * - If it does not, seed the server with whatever we currently have so this
 *   device's data starts syncing.
 *
 * `apply` receives the remote snapshot and should swap it into store state and
 * notify listeners. `current` returns the state to seed the server with.
 */
export function hydrateRemote<T>(
  key: string,
  apply: (remote: T) => void,
  current: () => T
) {
  if (!canSync()) return;
  fetchRemote<T>(key).then((remote) => {
    if (remote != null) {
      apply(remote);
    } else {
      pushRemote(key, current());
    }
  });
}
