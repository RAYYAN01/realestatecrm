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
import type { Prospect } from "@/lib/mock-data";

export type ProspectFormValues = Omit<Prospect, "id">;

export function ProspectFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProspectFormValues) => void;
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [interestLevel, setInterestLevel] = React.useState<Prospect["interestLevel"]>("Medium");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState("");

  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(""); setPhone(""); setEmail(""); setLocation("");
      setBudget(""); setInterestLevel("Medium"); setNotes(""); setError("");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    onSubmit({
      name: name.trim(),
      phone: phone.trim() || "+91 90000 00000",
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      location: location.trim() || "Lahore",
      budget: Number(budget) || 15_000_000,
      interestLevel,
      notes: notes.trim() || "Newly added prospect.",
      createdAt: new Date().toISOString(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add Prospect</DialogTitle>
            <DialogDescription>Capture an early-interest contact to nurture.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="pr-name">Full Name</Label>
              <Input id="pr-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!error} placeholder="e.g. Ahmed Khan" />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pr-phone">Phone</Label>
              <Input id="pr-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pr-email">Email</Label>
              <Input id="pr-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pr-loc">Location</Label>
              <Input id="pr-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Gulberg, Lahore" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pr-budget">Budget (₹)</Label>
              <Input id="pr-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="15000000" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Interest Level</Label>
              <Select value={interestLevel} onValueChange={(v) => v && setInterestLevel(v as Prospect["interestLevel"])} items={{ Low: "Low", Medium: "Medium", High: "High" }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="pr-notes">Notes</Label>
              <Textarea id="pr-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-20" placeholder="Any context about this prospect…" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Prospect</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
