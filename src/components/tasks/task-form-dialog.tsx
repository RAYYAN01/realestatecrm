"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadCombobox } from "@/components/shared/lead-combobox";
import type { Task, Priority } from "@/lib/mock-data";

const agentsList = ["Sara Ahmed", "Omar Khalid", "Fatima Noor", "Ali Raza", "Hina Malik", "Bilal Sheikh"];
const priorities: Priority[] = ["Low", "Medium", "High"];
const statuses: Task["status"][] = ["To Do", "In Progress", "Done"];

export type TaskFormValues = Omit<Task, "id">;

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultLeadId,
  defaultLeadName,
  lockLead = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TaskFormValues) => void;
  defaultLeadId?: string;
  defaultLeadName?: string;
  lockLead?: boolean;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState(agentsList[0]);
  const [leadId, setLeadId] = React.useState<string | undefined>(defaultLeadId);
  const [leadName, setLeadName] = React.useState<string | undefined>(defaultLeadName);
  const [priority, setPriority] = React.useState<Priority>("Medium");
  const [dueDate, setDueDate] = React.useState("");
  const [status, setStatus] = React.useState<Task["status"]>("To Do");
  const [error, setError] = React.useState("");

  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTitle(""); setDescription(""); setAssignedTo(agentsList[0]);
      setLeadId(defaultLeadId); setLeadName(defaultLeadName);
      setPriority("Medium"); setStatus("To Do"); setError("");
      const d = new Date(); d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().slice(0, 10));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Task title is required."); return; }
    onSubmit({
      title: title.trim(),
      description: description.trim() || "No description provided.",
      assignedTo,
      leadId,
      relatedLead: leadName,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      status,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>Create a task and link it to a lead.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-title">Task Name</Label>
              <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!error} placeholder="e.g. Send updated brochure" />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20" placeholder="Optional details…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Assigned To</Label>
                <Select value={assignedTo} onValueChange={(v) => v && setAssignedTo(v)} items={Object.fromEntries(agentsList.map((a) => [a, a]))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {agentsList.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-due">Due Date</Label>
                <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Related Lead</Label>
              {lockLead ? (
                <Input value={leadName ?? "—"} disabled />
              ) : (
                <LeadCombobox value={leadId} onChange={(id, name) => { setLeadId(id); setLeadName(name); }} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => v && setPriority(v as Priority)} items={Object.fromEntries(priorities.map((p) => [p, p]))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => v && setStatus(v as Task["status"])} items={Object.fromEntries(statuses.map((s) => [s, s]))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
