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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lead, LeadStatus, Priority } from "@/lib/mock-data";

const propertyTypes = ["Apartment", "House", "Plot", "Commercial", "Villa"];
const purposes = ["Buy", "Rent", "Invest"] as const;
const sources = ["Website", "Facebook Ads", "Referral", "Walk-in", "Zameen.com", "Cold Call"];
const agentsList = ["Sara Ahmed", "Omar Khalid", "Fatima Noor", "Ali Raza", "Hina Malik", "Bilal Sheikh"];
const statuses: LeadStatus[] = ["New", "Contacted", "Interested", "Qualified", "Negotiation", "Won", "Lost"];
const priorities: Priority[] = ["Low", "Medium", "High"];

type FormState = {
  name: string;
  phone: string;
  email: string;
  location: string;
  budgetMin: string;
  budgetMax: string;
  propertyType: string;
  purpose: string;
  source: string;
  agent: string;
  priority: string;
  status: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    phone: "",
    email: "",
    location: "",
    budgetMin: "",
    budgetMax: "",
    propertyType: propertyTypes[0],
    purpose: purposes[0],
    source: sources[0],
    agent: agentsList[0],
    priority: "Medium",
    status: "New",
  };
}

function leadToForm(lead: Lead): FormState {
  return {
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    location: lead.location,
    budgetMin: String(lead.budgetMin),
    budgetMax: String(lead.budgetMax),
    propertyType: lead.propertyType,
    purpose: lead.purpose,
    source: lead.source,
    agent: lead.agent,
    priority: lead.priority,
    status: lead.status,
  };
}

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  onSubmit: (values: FormState) => void;
}) {
  const [form, setForm] = React.useState<FormState>(() =>
    lead ? leadToForm(lead) : emptyForm()
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm(lead ? leadToForm(lead) : emptyForm());
      setErrors({});
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K] | null) {
    if (value === null) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      nextErrors.email = "Enter a valid email address.";
    if (
      form.budgetMin &&
      form.budgetMax &&
      Number(form.budgetMin) > Number(form.budgetMax)
    )
      nextErrors.budgetMax = "Maximum budget must exceed minimum budget.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(form);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{lead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
            <DialogDescription>
              {lead
                ? "Update the lead's details below."
                : "Enter the lead's details to add them to your pipeline."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="lead-name">Full Name</Label>
              <Input
                id="lead-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                aria-invalid={!!errors.name}
                placeholder="e.g. Ahmed Khan"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-phone">Phone Number</Label>
              <Input
                id="lead-phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                aria-invalid={!!errors.phone}
                placeholder="+91 XXXXX XXXXX"
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                aria-invalid={!!errors.email}
                placeholder="name@example.com"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="lead-location">Preferred Location</Label>
              <Input
                id="lead-location"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. DHA Phase 6, Lahore"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-budget-min">Minimum Budget (₹)</Label>
              <Input
                id="lead-budget-min"
                type="number"
                value={form.budgetMin}
                onChange={(e) => update("budgetMin", e.target.value)}
                placeholder="10000000"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-budget-max">Maximum Budget (₹)</Label>
              <Input
                id="lead-budget-max"
                type="number"
                value={form.budgetMax}
                onChange={(e) => update("budgetMax", e.target.value)}
                aria-invalid={!!errors.budgetMax}
                placeholder="30000000"
              />
              {errors.budgetMax && (
                <p className="text-xs text-destructive">{errors.budgetMax}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Property Type</Label>
              <Select value={form.propertyType} onValueChange={(v) => update("propertyType", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Purpose</Label>
              <Select value={form.purpose} onValueChange={(v) => update("purpose", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {purposes.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Lead Source</Label>
              <Select value={form.source} onValueChange={(v) => update("source", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Assigned Agent</Label>
              <Select value={form.agent} onValueChange={(v) => update("agent", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {agentsList.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => update("priority", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{lead ? "Save Changes" : "Add Lead"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
