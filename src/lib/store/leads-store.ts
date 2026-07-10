"use client";

import * as React from "react";
import {
  leads as seedLeads,
  buildLeadTimeline,
  buildLeadNotes,
  buildLeadDocuments,
  type Lead,
  type LeadStatus,
  type TimelineEvent,
  type TimelineEventType,
  type LeadNote,
  type LeadDocument,
  type WonDetails,
  type LostReason,
} from "@/lib/mock-data";
import { loadState, saveState } from "@/lib/store/persist";
import { auditStore } from "@/lib/store/audit-store";

type LeadsState = {
  leads: Lead[];
  timelines: Record<string, TimelineEvent[]>;
  notes: Record<string, LeadNote[]>;
  documents: Record<string, LeadDocument[]>;
};

const STORAGE_KEY = "leads";

function seed(): LeadsState {
  const timelines: Record<string, TimelineEvent[]> = {};
  const notes: Record<string, LeadNote[]> = {};
  const documents: Record<string, LeadDocument[]> = {};
  for (const lead of seedLeads) {
    timelines[lead.id] = buildLeadTimeline(lead);
    notes[lead.id] = buildLeadNotes(lead);
    documents[lead.id] = buildLeadDocuments(lead);
  }
  return { leads: seedLeads, timelines, notes, documents };
}

let state: LeadsState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  saveState(STORAGE_KEY, state);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    hydrated = true;
    const stored = loadState<LeadsState>(STORAGE_KEY);
    if (stored?.leads?.length) {
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

// A stable fixed clock keeps SSR and hydration deterministic; mutations happen
// only from user events (client-only) so a live Date is safe there.
function now() {
  return new Date().toISOString();
}

function pushTimeline(
  leadId: string,
  type: TimelineEventType,
  title: string,
  description: string,
  author = "You"
) {
  const event: TimelineEvent = {
    id: `${leadId}-${Date.now()}`,
    type,
    title,
    description,
    timestamp: now(),
    author,
  };
  state.timelines = {
    ...state.timelines,
    [leadId]: [event, ...(state.timelines[leadId] ?? [])],
  };
}

export const leadsStore = {
  subscribe,
  getSnapshot,

  addLead(lead: Lead) {
    state.leads = [lead, ...state.leads];
    state.timelines = { ...state.timelines, [lead.id]: buildLeadTimeline(lead) };
    state.notes = { ...state.notes, [lead.id]: [] };
    state.documents = { ...state.documents, [lead.id]: [] };
    auditStore.log({ action: "Created lead", target: `${lead.name} (${lead.id})`, category: "lead" });
    emit();
  },

  updateLead(id: string, patch: Partial<Lead>) {
    const before = state.leads.find((l) => l.id === id);
    state.leads = state.leads.map((l) => (l.id === id ? { ...l, ...patch } : l));
    if (before) auditStore.log({ action: "Updated lead", target: `${before.name} (${id})`, category: "lead" });
    emit();
  },

  deleteLead(id: string) {
    const before = state.leads.find((l) => l.id === id);
    state.leads = state.leads.filter((l) => l.id !== id);
    if (before) auditStore.log({ action: "Deleted lead", target: `${before.name} (${id})`, category: "lead" });
    emit();
  },

  deleteLeads(ids: Set<string>) {
    state.leads = state.leads.filter((l) => !ids.has(l.id));
    auditStore.log({ action: `Deleted ${ids.size} leads`, target: "Bulk action", category: "lead" });
    emit();
  },

  toggleFavorite(id: string) {
    state.leads = state.leads.map((l) =>
      l.id === id ? { ...l, favorite: !l.favorite } : l
    );
    emit();
  },

  /** Merge the `mergeId` lead into `keepId`, combining timelines/notes/documents. */
  mergeLeads(keepId: string, mergeId: string) {
    const keep = state.leads.find((l) => l.id === keepId);
    const merged = state.leads.find((l) => l.id === mergeId);
    if (!keep || !merged) return;
    state.timelines = {
      ...state.timelines,
      [keepId]: [
        ...(state.timelines[keepId] ?? []),
        ...(state.timelines[mergeId] ?? []),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    };
    state.notes = {
      ...state.notes,
      [keepId]: [...(state.notes[keepId] ?? []), ...(state.notes[mergeId] ?? [])],
    };
    state.documents = {
      ...state.documents,
      [keepId]: [...(state.documents[keepId] ?? []), ...(state.documents[mergeId] ?? [])],
    };
    state.leads = state.leads.filter((l) => l.id !== mergeId);
    pushTimeline(keepId, "note", "Leads merged", `Merged duplicate ${merged.name} (${mergeId}) into this lead.`);
    auditStore.log({ action: "Merged leads", target: `${merged.name} → ${keep.name}`, category: "lead" });
    emit();
  },

  changeStatus(id: string, status: LeadStatus, extra?: { wonDetails?: WonDetails; lostReason?: LostReason }) {
    state.leads = state.leads.map((l) =>
      l.id === id
        ? {
            ...l,
            status,
            lastContact: now(),
            wonDetails: status === "Won" ? extra?.wonDetails ?? l.wonDetails : undefined,
            lostReason: status === "Lost" ? extra?.lostReason ?? l.lostReason : undefined,
          }
        : l
    );
    const title =
      status === "Won" ? "Deal won" : status === "Lost" ? "Deal lost" : `Moved to ${status}`;
    const type: TimelineEventType =
      status === "Won" ? "won" : status === "Lost" ? "lost" : status === "Qualified" ? "qualified" : status === "Negotiation" ? "negotiation" : "note";
    pushTimeline(id, type, title, `Stage changed to ${status}.`);
    const changed = state.leads.find((l) => l.id === id);
    if (changed) auditStore.log({ action: `Stage → ${status}`, target: `${changed.name} (${id})`, category: "lead" });
    emit();
  },

  changeStatusBulk(ids: Set<string>, status: LeadStatus) {
    state.leads = state.leads.map((l) =>
      ids.has(l.id) ? { ...l, status, lastContact: now() } : l
    );
    emit();
  },

  assignAgentBulk(ids: Set<string>, agent: string) {
    state.leads = state.leads.map((l) =>
      ids.has(l.id) ? { ...l, agent } : l
    );
    emit();
  },

  logInteraction(leadId: string, type: TimelineEventType, title: string, description: string) {
    pushTimeline(leadId, type, title, description);
    state.leads = state.leads.map((l) =>
      l.id === leadId ? { ...l, lastContact: now() } : l
    );
    emit();
  },

  addNote(leadId: string, content: string) {
    const note: LeadNote = {
      id: `${leadId}-note-${Date.now()}`,
      author: "You",
      content,
      timestamp: now(),
      pinned: false,
    };
    state.notes = {
      ...state.notes,
      [leadId]: [note, ...(state.notes[leadId] ?? [])],
    };
    pushTimeline(leadId, "note", "Note added", content.slice(0, 80));
    emit();
  },

  togglePinNote(leadId: string, noteId: string) {
    state.notes = {
      ...state.notes,
      [leadId]: (state.notes[leadId] ?? []).map((n) =>
        n.id === noteId ? { ...n, pinned: !n.pinned } : n
      ),
    };
    emit();
  },

  deleteNote(leadId: string, noteId: string) {
    state.notes = {
      ...state.notes,
      [leadId]: (state.notes[leadId] ?? []).filter((n) => n.id !== noteId),
    };
    emit();
  },

  addDocument(leadId: string, doc: LeadDocument) {
    state.documents = {
      ...state.documents,
      [leadId]: [doc, ...(state.documents[leadId] ?? [])],
    };
    pushTimeline(leadId, "note", "Document uploaded", doc.name);
    emit();
  },
};

export function useLeads() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useLead(id: string) {
  const snapshot = useLeads();
  return {
    lead: snapshot.leads.find((l) => l.id === id) ?? null,
    timeline: snapshot.timelines[id] ?? [],
    notes: snapshot.notes[id] ?? [],
    documents: snapshot.documents[id] ?? [],
  };
}

export type DuplicateGroup = {
  key: string;
  leads: Lead[];
};

/** Group leads that share a normalized name or phone — likely duplicates. */
export function findDuplicateGroups(leads: Lead[]): DuplicateGroup[] {
  const byKey = new Map<string, Lead[]>();
  for (const lead of leads) {
    const nameKey = `name:${lead.name.trim().toLowerCase()}`;
    byKey.set(nameKey, [...(byKey.get(nameKey) ?? []), lead]);
  }
  return Array.from(byKey.entries())
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({ key, leads: group }));
}
