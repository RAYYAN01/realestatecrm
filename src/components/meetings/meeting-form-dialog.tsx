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
import { LeadCombobox } from "@/components/shared/lead-combobox";
import type { Meeting } from "@/lib/mock-data";

const locations = [
  "DHA Phase 6, Lahore", "Bahria Town, Karachi", "F-10, Islamabad",
  "Gulberg, Lahore", "Clifton, Karachi", "Office — Gulberg III",
];

export type MeetingFormValues = Omit<Meeting, "id">;

export function MeetingFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultLeadId,
  defaultLeadName,
  defaultDate,
  lockLead = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MeetingFormValues) => void;
  defaultLeadId?: string;
  defaultLeadName?: string;
  /** Pre-fill the date field (yyyy-MM-dd), e.g. when opened from the calendar. */
  defaultDate?: string;
  lockLead?: boolean;
}) {
  const [title, setTitle] = React.useState("");
  const [leadId, setLeadId] = React.useState<string | undefined>(defaultLeadId);
  const [leadName, setLeadName] = React.useState<string>(defaultLeadName ?? "");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("10:00");
  const [location, setLocation] = React.useState(locations[0]);
  const [link, setLink] = React.useState("");
  const [error, setError] = React.useState("");

  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTitle(""); setLeadId(defaultLeadId); setLeadName(defaultLeadName ?? "");
      setLocation(locations[0]); setLink(""); setTime("10:00"); setError("");
      setDate(defaultDate ?? new Date().toISOString().slice(0, 10));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Meeting title is required."); return; }
    if (!leadName) { setError("Please select a lead."); return; }
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    onSubmit({
      title: title.trim(),
      leadId,
      leadName,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      time: `${h12}:${String(m).padStart(2, "0")} ${period}`,
      location,
      participants: ["Sara Ahmed"],
      status: "Scheduled",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>Book a meeting and link it to a lead.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mtg-title">Meeting Title</Label>
              <Input id="mtg-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!error} placeholder="e.g. Site visit — Clifton Villa" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Lead</Label>
              {lockLead ? (
                <Input value={leadName || "—"} disabled />
              ) : (
                <LeadCombobox value={leadId} onChange={(id, name) => { setLeadId(id); setLeadName(name); }} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mtg-date">Date</Label>
                <Input id="mtg-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mtg-time">Time</Label>
                <Input id="mtg-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mtg-loc">Location</Label>
              <Input id="mtg-loc" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mtg-link">Meeting Link (optional)</Label>
              <Input id="mtg-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/…" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
