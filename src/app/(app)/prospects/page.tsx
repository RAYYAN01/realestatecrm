"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, MoreHorizontal, ArrowUpRight, Trash2, UserSearch } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
  DropdownMenuSeparator,
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
import { ProspectFormDialog } from "@/components/prospects/prospect-form-dialog";
import { formatCurrencyPKR, type Prospect } from "@/lib/mock-data";
import { useProspects, prospectsStore } from "@/lib/store/prospects-store";
import { cn } from "@/lib/utils";

const interestStyles: Record<Prospect["interestLevel"], string> = {
  Low: "bg-muted text-muted-foreground border-0",
  Medium: "bg-warning/15 text-warning-foreground dark:text-warning border-0",
  High: "bg-success/10 text-success border-0",
};

export default function ProspectsPage() {
  const router = useRouter();
  const prospects = useProspects();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [interestFilter, setInterestFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return prospects.filter((p) => {
      if (q && !(p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q))) return false;
      if (interestFilter !== "all" && p.interestLevel !== interestFilter) return false;
      return true;
    });
  }, [prospects, search, interestFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  function convertToLead(p: Prospect) {
    const lead = prospectsStore.convertToLead(p.id, "Sara Ahmed");
    if (!lead) return;
    toast.success(`${p.name} converted to a lead`, {
      description: "Added to the Leads pipeline as a New lead.",
      action: {
        label: "Open lead",
        onClick: () => router.push(`/leads/${lead.id}`),
      },
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Prospects"
        description="People showing early interest, not yet qualified as leads."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Prospects" }]}
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus />
            Add Prospect
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search prospects…"
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={interestFilter}
          onValueChange={(v) => { setInterestFilter(v ?? "all"); setPage(1); }}
          items={{ all: "All Interest Levels", Low: "Low", Medium: "Medium", High: "High" }}
        >
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Interest Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Interest Levels</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} prospect{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="rounded-xl border border-border/70 glass">
        {loading ? (
          <TableSkeleton rows={7} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserSearch}
            title="No prospects found"
            description="Try a different search, or add a new prospect to start nurturing them."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.location}</TableCell>
                    <TableCell className="text-muted-foreground">{formatCurrencyPKR(p.budget)}</TableCell>
                    <TableCell>
                      <Badge variant="ghost" className={cn("font-medium", interestStyles[p.interestLevel])}>
                        {p.interestLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-64 truncate text-muted-foreground">{p.notes}</TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => convertToLead(p)}>
                            <ArrowUpRight />
                            Convert to Lead
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(p.id)}>
                            <Trash2 />
                            Delete
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this prospect?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteTarget) prospectsStore.deleteProspect(deleteTarget);
          toast.success("Prospect deleted");
        }}
      />

      <ProspectFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(values) => {
          prospectsStore.addProspect(values);
          toast.success("Prospect added", { description: `${values.name} was added to your prospects.` });
        }}
      />
    </div>
  );
}
