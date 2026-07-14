"use client";

import * as React from "react";
import {
  tasks as seedTasks,
  meetings as seedMeetings,
  calls as seedCalls,
  type Task,
  type Meeting,
  type CallLog,
} from "@/lib/mock-data";
import { loadState, saveState } from "@/lib/store/persist";
import { hydrateRemote, pushRemote } from "@/lib/store/remote";

type ActivitiesState = {
  tasks: Task[];
  meetings: Meeting[];
  calls: CallLog[];
};

const STORAGE_KEY = "activities";

let state: ActivitiesState = {
  tasks: seedTasks,
  meetings: seedMeetings,
  calls: seedCalls,
};
let hydrated = false;

const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  saveState(STORAGE_KEY, state);
  pushRemote(STORAGE_KEY, state);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    hydrated = true;
    const stored = loadState<ActivitiesState>(STORAGE_KEY);
    if (stored?.tasks) {
      state = stored;
      queueMicrotask(() => listeners.forEach((l) => l()));
    }
    hydrateRemote<ActivitiesState>(
      STORAGE_KEY,
      (remote) => {
        if (!remote?.tasks) return;
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

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const activitiesStore = {
  subscribe,
  getSnapshot,

  // Tasks -------------------------------------------------------------------
  addTask(task: Omit<Task, "id">) {
    state.tasks = [{ ...task, id: uid("TSK") }, ...state.tasks];
    emit();
  },
  updateTask(id: string, patch: Partial<Task>) {
    state.tasks = state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
    emit();
  },
  setTaskStatus(id: string, status: Task["status"]) {
    state.tasks = state.tasks.map((t) => (t.id === id ? { ...t, status } : t));
    emit();
  },
  deleteTask(id: string) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    emit();
  },

  // Meetings ----------------------------------------------------------------
  addMeeting(meeting: Omit<Meeting, "id">) {
    state.meetings = [{ ...meeting, id: uid("MTG") }, ...state.meetings];
    emit();
  },
  setMeetingStatus(id: string, status: Meeting["status"]) {
    state.meetings = state.meetings.map((m) => (m.id === id ? { ...m, status } : m));
    emit();
  },
  deleteMeeting(id: string) {
    state.meetings = state.meetings.filter((m) => m.id !== id);
    emit();
  },

  // Calls -------------------------------------------------------------------
  addCall(call: Omit<CallLog, "id">) {
    state.calls = [{ ...call, id: uid("CALL") }, ...state.calls];
    emit();
  },
  deleteCall(id: string) {
    state.calls = state.calls.filter((c) => c.id !== id);
    emit();
  },
};

export function useActivities() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useLeadActivities(leadId: string) {
  const snapshot = useActivities();
  return {
    tasks: snapshot.tasks.filter((t) => t.leadId === leadId),
    meetings: snapshot.meetings.filter((m) => m.leadId === leadId),
    calls: snapshot.calls.filter((c) => c.leadId === leadId),
  };
}
