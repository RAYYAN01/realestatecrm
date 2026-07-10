"use client";

import { Copy, Merge } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrencyPKR, type Lead } from "@/lib/mock-data";
import { findDuplicateGroups, leadsStore } from "@/lib/store/leads-store";
import { toast } from "sonner";

export function DuplicatesDialog({
  open,
  onOpenChange,
  leads,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
}) {
  const groups = findDuplicateGroups(leads);

  function mergeGroup(group: Lead[]) {
    const [keep, ...rest] = group;
    rest.forEach((dupe) => leadsStore.mergeLeads(keep.id, dupe.id));
    toast.success(`Merged ${rest.length + 1} records into ${keep.name}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Duplicate Detection</DialogTitle>
          <DialogDescription>
            Leads that appear to be the same person (matched by name). Review and merge to keep your pipeline clean.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {groups.length === 0 ? (
            <EmptyState icon={Copy} title="No duplicates found" description="Every lead looks unique. Nice and tidy." className="border-none" />
          ) : (
            groups.map((group) => (
              <div key={group.key} className="rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <span className="text-sm font-medium text-foreground">
                    {group.leads[0].name}{" "}
                    <span className="text-muted-foreground">· {group.leads.length} records</span>
                  </span>
                  <Button size="sm" onClick={() => mergeGroup(group.leads)}>
                    <Merge />
                    Merge all
                  </Button>
                </div>
                <div className="flex flex-col divide-y divide-border">
                  {group.leads.map((lead, i) => (
                    <div key={lead.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{lead.id}</span>
                        {i === 0 && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground">{lead.location}</span>
                      <span className="text-muted-foreground">
                        {formatCurrencyPKR(lead.budgetMin)}–{formatCurrencyPKR(lead.budgetMax)}
                      </span>
                      <StatusBadge status={lead.status} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
