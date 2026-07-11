// Lightweight localStorage persistence for the in-memory demo stores.
// Hydration is deferred to the client (after mount) so the server and the
// initial client render always share the deterministic seed snapshot — this
// avoids React hydration mismatches. See [[feedback-crm-shadcn-baseui]].

const PREFIX = "naaz-ai-crm:v3:";

export function loadState<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveState<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota / serialization errors in the demo
  }
}

export function clearState(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
