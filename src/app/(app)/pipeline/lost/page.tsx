"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { XCircle, RotateCcw, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PipelineTabs } from "@/components/pipeline/pipeline-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyPKR, type LostReason } from "@/lib/mock-data";
import { useLeads, leadsStore } from "@/lib/store/leads-store";

const allReasons: LostReason[] = [
  "Price Issue", "No Response", "Competitor", "Budget", "Cancelled", "Other",
];

export default function LostLeadsPage() {
  const { leads } = useLeads();
  const [search, setSearch] = React.useState("");
  const [reasonFilter, setReasonFilter] = React.useState<LostReason | "all">("all");

  const lost = React.useMemo(() => leads.filter((l) => l.status === "Lost"), [leads]);

  const reasonCounts = React.useMemo(() => {
    const counts = new Map<LostReason, number>();
    allReasons.forEach((r) => counts.set(r, 0));
    lost.forEach((l) => {
      const r = l.lostReason ?? "Other";
      counts.set(r, (counts.get(r) ?? 0) + 1);
    });
    return counts;
  }, [lost]);

  const filtered = lost.filter((l) => {
    const q = search.trim().toLowerCase();
    if (q && !l.name.toLowerCase().includes(q)) return false;
    if (reasonFilter !== "all" && (l.lostReason ?? "Other") !== reasonFilter) return false;
    return true;
  });

  function reactivate(id: string, name: string) {
    leadsStore.changeStatus(id, "Contacted");
    toast.success(`${name} reactivated`, { description: "Moved back into the pipeline as Contacted." });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Lost Leads"
        description="Deals that didn't close — review reasons and reactivate when the time is right."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pipeline", href: "/pipeline" },
          { label: "Lost" },
        ]}
      />

      <PipelineTabs />

      {/* Reason breakdown */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card
          className={`cursor-pointer gap-1 p-3 transition-colors ${reasonFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setReasonFilter("all")}
        >
          <span className="text-xs text-muted-foreground">All Lost</span>
          <span className="text-xl font-semibold text-foreground">{lost.length}</span>
        </Card>
        {allReasons.map((reason) => (
          <Card
            key={reason}
            className={`cursor-pointer gap-1 p-3 transition-colors ${reasonFilter === reason ? "ring-2 ring-primary" : ""}`}
            onClick={() => setReasonFilter((r) => (r === reason ? "all" : reason))}
          >
            <span className="text-xs text-muted-foreground">{reason}</span>
            <span className="text-xl font-semibold text-foreground">{reasonCounts.get(reason) ?? 0}</span>
          </Card>
        ))}
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search lost leads…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border/70 glass">
        {filtered.length === 0 ? (
          <EmptyState icon={XCircle} title="No lost leads" description="Leads marked as lost will appear here." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Lead</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Reason Lost</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead className="pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="pl-4">
                    <Link href={`/leads/${lead.id}`} className="font-medium text-foreground hover:text-primary hover:underline">
                      {lead.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{lead.phone}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.location}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrencyPKR(lead.budgetMin)}–{formatCurrencyPKR(lead.budgetMax)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="ghost" className="border-0 bg-destructive/10 font-medium text-destructive">
                      {lead.lostReason ?? "Other"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.agent}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(lead.lastContact), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="pr-4">
                    <Button variant="outline" size="sm" onClick={() => reactivate(lead.id, lead.name)}>
                      <RotateCcw />
                      Reactivate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
