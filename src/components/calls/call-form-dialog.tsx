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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadCombobox } from "@/components/shared/lead-combobox";
import type { CallLog } from "@/lib/mock-data";

const agentsList = ["Sara Ahmed", "Omar Khalid", "Fatima Noor", "Ali Raza", "Hina Malik", "Bilal Sheikh"];

export type CallFormValues = Omit<CallLog, "id">;

export function CallFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultLeadId,
  defaultLeadName,
  lockLead = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CallFormValues) => void;
  defaultLeadId?: string;
  defaultLeadName?: string;
  lockLead?: boolean;
}) {
  const [leadId, setLeadId] = React.useState<string | undefined>(defaultLeadId);
  const [leadName, setLeadName] = React.useState<string>(defaultLeadName ?? "");
  const [direction, setDirection] = React.useState<CallLog["direction"]>("Outgoing");
  const [duration, setDuration] = React.useState("5:00");
  const [agent, setAgent] = React.useState(agentsList[0]);
  const [summary, setSummary] = React.useState("");
  const [followUp, setFollowUp] = React.useState(false);
  const [error, setError] = React.useState("");

  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setLeadId(defaultLeadId); setLeadName(defaultLeadName ?? "");
      setDirection("Outgoing"); setDuration("5:00"); setAgent(agentsList[0]);
      setSummary(""); setFollowUp(false); setError("");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadName) { setError("Please select a lead."); return; }
    onSubmit({
      leadId,
      leadName,
      direction,
      duration,
      agent,
      summary: summary.trim() || "No summary provided.",
      followUp,
      timestamp: new Date().toISOString(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>Record a call and link it to a lead.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label>Lead</Label>
              {lockLead ? (
                <Input value={leadName || "—"} disabled />
              ) : (
                <LeadCombobox value={leadId} onChange={(id, name) => { setLeadId(id); setLeadName(name); }} />
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Direction</Label>
                <Select value={direction} onValueChange={(v) => v && setDirection(v as CallLog["direction"])} items={{ Incoming: "Incoming", Outgoing: "Outgoing" }}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Incoming">Incoming</SelectItem>
                    <SelectItem value="Outgoing">Outgoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="call-dur">Duration</Label>
                <Input id="call-dur" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="mm:ss" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Agent</Label>
                <Select value={agent} onValueChange={(v) => v && setAgent(v)} items={Object.fromEntries(agentsList.map((a) => [a, a]))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {agentsList.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="call-summary">Summary</Label>
              <Textarea id="call-summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="min-h-20" placeholder="What was discussed?" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Follow-up required</p>
                <p className="text-xs text-muted-foreground">Flag this call for a follow-up.</p>
              </div>
              <Switch checked={followUp} onCheckedChange={setFollowUp} />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Log Call</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
