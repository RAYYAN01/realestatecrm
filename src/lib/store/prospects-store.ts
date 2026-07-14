"use client";

import * as React from "react";
import { prospects as seedProspects, type Prospect, type Lead } from "@/lib/mock-data";
import { leadsStore } from "@/lib/store/leads-store";
import { loadState, saveState } from "@/lib/store/persist";
import { hydrateRemote, pushRemote } from "@/lib/store/remote";
import { auditStore } from "@/lib/store/audit-store";

const STORAGE_KEY = "prospects";

let state: Prospect[] = seedProspects;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  state = [...state];
  saveState(STORAGE_KEY, state);
  pushRemote(STORAGE_KEY, state);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    hydrated = true;
    const stored = loadState<Prospect[]>(STORAGE_KEY);
    if (stored?.length) {
      state = stored;
      queueMicrotask(() => listeners.forEach((l) => l()));
    }
    hydrateRemote<Prospect[]>(
      STORAGE_KEY,
      (remote) => {
        if (!Array.isArray(remote)) return;
        state = remote;
        saveState(STORAGE_KEY, state);
        listeners.forEach((l) => l());
      },
      () => state
    );
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export const prospectsStore = {
  subscribe,
  getSnapshot,

  addProspect(prospect: Omit<Prospect, "id">) {
    const p: Prospect = { ...prospect, id: `PR-${Date.now()}` };
    state = [p, ...state];
    emit();
  },

  deleteProspect(id: string) {
    state = state.filter((p) => p.id !== id);
    emit();
  },

  /** Convert a prospect into a New lead in the leads store and remove it here. */
  convertToLead(id: string, agent: string): Lead | null {
    const prospect = state.find((p) => p.id === id);
    if (!prospect) return null;

    const nowIso = new Date().toISOString();
    const budgetMin = Math.max(0, Math.round(prospect.budget * 0.85));
    const lead: Lead = {
      id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: prospect.name,
      phone: prospect.phone,
      email: prospect.email,
      location: prospect.location,
      budgetMin,
      budgetMax: prospect.budget,
      propertyType: "Apartment",
      purpose: "Buy",
      source: "Prospect Conversion",
      agent,
      priority:
        prospect.interestLevel === "High"
          ? "High"
          : prospect.interestLevel === "Medium"
          ? "Medium"
          : "Low",
      status: "New",
      createdAt: nowIso,
      lastContact: nowIso,
      bedrooms: 3,
      bathrooms: 2,
      areaRequired: "10 Marla",
      possession: "Ready to Move",
      facing: "North",
      parking: 1,
      amenities: [],
    };

    leadsStore.addLead(lead);
    state = state.filter((p) => p.id !== id);
    auditStore.log({ action: "Converted prospect to lead", target: `${prospect.name} → ${lead.id}`, category: "prospect" });
    emit();
    return lead;
  },
};

export function useProspects() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
