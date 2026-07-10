"use client";

import * as React from "react";
import { loadState, saveState } from "@/lib/store/persist";

export type AuditEntry = {
  id: string;
  action: string;
  target: string;
  actor: string;
  timestamp: string;
  category: "lead" | "task" | "meeting" | "call" | "prospect" | "auth" | "settings";
};

const STORAGE_KEY = "audit-log";

let state: AuditEntry[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  state = [...state];
  saveState(STORAGE_KEY, state);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    hydrated = true;
    const stored = loadState<AuditEntry[]>(STORAGE_KEY);
    if (stored) {
      state = stored;
      queueMicrotask(() => listeners.forEach((l) => l()));
    }
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export const auditStore = {
  subscribe,
  getSnapshot,
  log(entry: Omit<AuditEntry, "id" | "timestamp" | "actor"> & { actor?: string }) {
    state = [
      {
        id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        actor: entry.actor ?? "Sara Ahmed",
        action: entry.action,
        target: entry.target,
        category: entry.category,
      },
      ...state,
    ].slice(0, 200);
    emit();
  },
  clear() {
    state = [];
    emit();
  },
};

export function useAuditLog() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => state);
}
