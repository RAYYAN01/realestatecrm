"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PipelineTabs } from "@/components/pipeline/pipeline-tabs";
import { LeadKanbanCard } from "@/components/pipeline/lead-kanban-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrencyPKR, type LeadStatus } from "@/lib/mock-data";
import { useLeads, leadsStore } from "@/lib/store/leads-store";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

const boardStages: LeadStatus[] = [
  "New", "Contacted", "Interested", "Qualified", "Negotiation", "Won", "Lost",
];

const stageAccent: Record<LeadStatus, string> = {
  New: "bg-info",
  Contacted: "bg-chart-5",
  Interested: "bg-chart-2",
  Qualified: "bg-warning",
  Negotiation: "bg-chart-4",
  Won: "bg-success",
  Lost: "bg-destructive",
};

export default function PipelinePage() {
  const { leads } = useLeads();
  const { isAdmin } = useAuth();
  const [search, setSearch] = React.useState("");
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = React.useState<LeadStatus | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) => l.name.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const byStage = React.useMemo(() => {
    const map = new Map<LeadStatus, typeof leads>();
    boardStages.forEach((s) => map.set(s, []));
    filtered.forEach((l) => map.get(l.status)?.push(l));
    return map;
  }, [filtered]);

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  }

  function handleDrop(stage: LeadStatus) {
    setDragOverStage(null);
    if (!draggingId) return;
    const lead = leads.find((l) => l.id === draggingId);
    setDraggingId(null);
    if (!lead || lead.status === stage) return;

    if (stage === "Won") {
      leadsStore.changeStatus(lead.id, "Won", {
        wonDetails: {
          revenue: lead.budgetMax,
          closingDate: new Date().toISOString(),
          propertyPurchased: `${lead.propertyType} — ${lead.location}`,
          commission: Math.round(lead.budgetMax * 0.02),
        },
      });
      toast.success(`${lead.name} — deal won! 🎉`);
    } else if (stage === "Lost") {
      leadsStore.changeStatus(lead.id, "Lost", { lostReason: "Other" });
      toast.success(`${lead.name} moved to Lost`);
    } else {
      leadsStore.changeStatus(lead.id, stage);
      toast.success(`${lead.name} moved to ${stage}`);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Sales Pipeline"
        description="Drag leads across stages to update their status in real time."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pipeline" }]}
        actions={
          <Button size="sm" nativeButton={false} render={<Link href="/leads" />}>
            <Plus />
            New Lead
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PipelineTabs />
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pipeline…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-2">
        <div className="flex min-w-max gap-4">
          {boardStages.map((stage) => {
            const items = byStage.get(stage) ?? [];
            const totalValue = items.reduce((sum, l) => sum + l.budgetMax, 0);
            return (
              <div
                key={stage}
                onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
                onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
                onDrop={() => handleDrop(stage)}
                className={cn(
                  "flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-transparent p-1 transition-colors",
                  dragOverStage === stage && "border-primary/40 bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", stageAccent[stage])} />
                    <span className="text-sm font-semibold text-foreground">{stage}</span>
                    <span className="rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <p className="px-2 text-xs text-muted-foreground">
                    {formatCurrencyPKR(totalValue)}
                  </p>
                )}

                <div className="flex min-h-24 flex-col gap-2.5">
                  {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                      Drop leads here
                    </div>
                  ) : (
                    items.map((lead) => (
                      <LeadKanbanCard
                        key={lead.id}
                        lead={lead}
                        dragging={draggingId === lead.id}
                        onDragStart={handleDragStart}
                        onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
