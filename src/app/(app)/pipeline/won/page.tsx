"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Trophy, Wallet, TrendingUp, Percent, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PipelineTabs } from "@/components/pipeline/pipeline-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyPKR } from "@/lib/mock-data";
import { useLeads } from "@/lib/store/leads-store";

export default function WonLeadsPage() {
  const { leads } = useLeads();
  const [search, setSearch] = React.useState("");

  const won = React.useMemo(
    () => leads.filter((l) => l.status === "Won" && l.wonDetails),
    [leads]
  );

  const filtered = won.filter((l) => {
    const q = search.trim().toLowerCase();
    return !q || l.name.toLowerCase().includes(q) || l.agent.toLowerCase().includes(q);
  });

  const totalRevenue = won.reduce((s, l) => s + (l.wonDetails?.revenue ?? 0), 0);
  const totalCommission = won.reduce((s, l) => s + (l.wonDetails?.commission ?? 0), 0);
  const avgDeal = won.length > 0 ? Math.round(totalRevenue / won.length) : 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Won Leads"
        description="Closed deals with revenue, commission and property details."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pipeline", href: "/pipeline" },
          { label: "Won" },
        ]}
      />

      <PipelineTabs />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Deals Won" value={String(won.length)} icon={Trophy} tone="success" />
        <StatCard label="Total Revenue" value={formatCurrencyPKR(totalRevenue)} icon={Wallet} tone="success" />
        <StatCard label="Total Commission" value={formatCurrencyPKR(totalCommission)} icon={Percent} tone="primary" />
        <StatCard label="Avg Deal Size" value={formatCurrencyPKR(avgDeal)} icon={TrendingUp} />
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search won deals…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border/70 glass">
        {filtered.length === 0 ? (
          <EmptyState icon={Trophy} title="No won deals yet" description="Deals you close will appear here with their revenue and commission." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Client</TableHead>
                <TableHead>Property Purchased</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Closing Date</TableHead>
                <TableHead className="pr-4">Sales Agent</TableHead>
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
                  <TableCell className="text-muted-foreground">{lead.wonDetails?.propertyPurchased}</TableCell>
                  <TableCell className="font-medium text-success">{formatCurrencyPKR(lead.wonDetails!.revenue)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatCurrencyPKR(lead.wonDetails!.commission)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(lead.wonDetails!.closingDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {lead.agent.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{lead.agent}</span>
                    </div>
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
