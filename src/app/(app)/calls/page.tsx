"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PlayCircle,
  MoreHorizontal,
  CalendarPlus,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActivities, activitiesStore } from "@/lib/store/activities-store";
import { CallFormDialog } from "@/components/calls/call-form-dialog";

export default function CallsPage() {
  const { calls } = useActivities();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [directionFilter, setDirectionFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [formOpen, setFormOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return calls.filter((c) => {
      if (q && !c.leadName.toLowerCase().includes(q)) return false;
      if (directionFilter !== "all" && c.direction !== directionFilter) return false;
      return true;
    });
  }, [calls, search, directionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Calls"
        description="Call logs, recordings and follow-up reminders."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Calls" }]}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus />
            Log Call
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by lead…"
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={directionFilter}
          onValueChange={(v) => { setDirectionFilter(v ?? "all"); setPage(1); }}
          items={{ all: "All Calls", Incoming: "Incoming", Outgoing: "Outgoing" }}
        >
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Direction" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Calls</SelectItem>
            <SelectItem value="Incoming">Incoming</SelectItem>
            <SelectItem value="Outgoing">Outgoing</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} call{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="rounded-xl border border-border/70 glass">
        {loading ? (
          <TableSkeleton rows={7} columns={7} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Phone} title="No calls found" description="Try a different search or filter." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Lead</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-4 font-medium">
                      {c.leadId ? (
                        <Link href={`/leads/${c.leadId}`} className="text-foreground hover:text-primary hover:underline">
                          {c.leadName}
                        </Link>
                      ) : (
                        <span className="text-foreground">{c.leadName}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {c.direction === "Incoming" ? (
                          <PhoneIncoming className="size-3.5 text-success" />
                        ) : (
                          <PhoneOutgoing className="size-3.5 text-info" />
                        )}
                        {c.direction}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.duration}</TableCell>
                    <TableCell className="text-muted-foreground">{c.agent}</TableCell>
                    <TableCell className="max-w-64 truncate text-muted-foreground">{c.summary}</TableCell>
                    <TableCell>
                      {c.followUp ? (
                        <Badge variant="ghost" className="border-0 bg-warning/15 font-medium text-warning-foreground dark:text-warning">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="ghost" className="border-0 bg-muted font-medium text-muted-foreground">
                          None
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(c.timestamp), "dd MMM, hh:mm a")}
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.success("Playing recording…")}>
                            <PlayCircle />
                            Play recording
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Follow-up call scheduled")}>
                            <CalendarPlus />
                            Schedule follow-up
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-4 pb-4">
              <PaginationBar
                page={clampedPage}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              />
            </div>
          </>
        )}
      </div>

      <CallFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(values) => {
          activitiesStore.addCall(values);
          toast.success("Call logged", { description: `${values.direction} call with ${values.leadName}` });
        }}
      />
    </div>
  );
}
