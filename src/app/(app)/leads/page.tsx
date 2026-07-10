"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  Trash2,
  UserCog,
  Merge,
  Mail,
  Phone,
  MoreHorizontal,
  Pencil,
  Eye,
  X,
  Star,
  Upload,
  Copy,
  Bookmark,
  Save,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { CsvImportDialog } from "@/components/leads/csv-import-dialog";
import { DuplicatesDialog } from "@/components/leads/duplicates-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import {
  formatCurrencyPKR,
  type Lead,
  type LeadStatus,
} from "@/lib/mock-data";
import { useLeads, leadsStore, findDuplicateGroups } from "@/lib/store/leads-store";
import { loadState, saveState } from "@/lib/store/persist";
import { exportToCsv, cn } from "@/lib/utils";

type SavedFilter = {
  id: string;
  name: string;
  search: string;
  statusFilter: string;
  priorityFilter: string;
  agentFilter: string;
  sourceFilter: string;
  typeFilter: string;
  favoritesOnly: boolean;
};

const SAVED_FILTERS_KEY = "lead-saved-filters";

const statuses: LeadStatus[] = [
  "New", "Contacted", "Interested", "Qualified", "Negotiation", "Won", "Lost",
];
const priorities = ["Low", "Medium", "High"] as const;
const agentsList = ["Sara Ahmed", "Omar Khalid", "Fatima Noor", "Ali Raza", "Hina Malik", "Bilal Sheikh"];
const sourcesList = ["Website", "Facebook Ads", "Referral", "Walk-in", "Zameen.com", "Cold Call"];
const propertyTypesList = ["Apartment", "House", "Plot", "Commercial", "Villa"];

function withAll(allLabel: string, list: readonly string[]) {
  return { all: allLabel, ...Object.fromEntries(list.map((v) => [v, v])) };
}

export default function LeadsPage() {
  const { leads } = useLeads();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [agentFilter, setAgentFilter] = React.useState("all");
  const [sourceFilter, setSourceFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<string | "bulk" | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [dupesOpen, setDupesOpen] = React.useState(false);

  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([]);
  // Load persisted views once on the client (render-phase, post-hydration safe).
  const [filtersLoaded, setFiltersLoaded] = React.useState(false);
  if (!filtersLoaded) {
    setFiltersLoaded(true);
    const stored = loadState<SavedFilter[]>(SAVED_FILTERS_KEY);
    if (stored?.length) setSavedFilters(stored);
  }

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const duplicateCount = React.useMemo(
    () => findDuplicateGroups(leads).reduce((sum, g) => sum + g.leads.length, 0),
    [leads]
  );

  const activeFilterCount = [agentFilter, sourceFilter, typeFilter].filter(
    (v) => v !== "all"
  ).length;

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (favoritesOnly && !l.favorite) return false;
      if (q) {
        const matches =
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (priorityFilter !== "all" && l.priority !== priorityFilter) return false;
      if (agentFilter !== "all" && l.agent !== agentFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (typeFilter !== "all" && l.propertyType !== typeFilter) return false;
      return true;
    });
  }, [leads, favoritesOnly, search, statusFilter, priorityFilter, agentFilter, sourceFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (clampedPage - 1) * pageSize,
    clampedPage * pageSize
  );

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setAgentFilter("all");
    setSourceFilter("all");
    setTypeFilter("all");
    setFavoritesOnly(false);
    setPage(1);
  }

  function persistSavedFilters(next: SavedFilter[]) {
    setSavedFilters(next);
    saveState(SAVED_FILTERS_KEY, next);
  }

  function saveCurrentFilter() {
    const name = window.prompt("Name this filter view:");
    if (!name?.trim()) return;
    const filter: SavedFilter = {
      id: `sf-${Date.now()}`,
      name: name.trim(),
      search, statusFilter, priorityFilter, agentFilter, sourceFilter, typeFilter, favoritesOnly,
    };
    persistSavedFilters([...savedFilters, filter]);
    toast.success(`Saved filter "${filter.name}"`);
  }

  function applySavedFilter(f: SavedFilter) {
    setSearch(f.search);
    setStatusFilter(f.statusFilter);
    setPriorityFilter(f.priorityFilter);
    setAgentFilter(f.agentFilter);
    setSourceFilter(f.sourceFilter);
    setTypeFilter(f.typeFilter);
    setFavoritesOnly(f.favoritesOnly);
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      if (paginated.every((l) => prev.has(l.id))) {
        const next = new Set(prev);
        paginated.forEach((l) => next.delete(l.id));
        return next;
      }
      const next = new Set(prev);
      paginated.forEach((l) => next.add(l.id));
      return next;
    });
  }

  function handleFormSubmit(values: {
    name: string; phone: string; email: string; location: string;
    budgetMin: string; budgetMax: string; propertyType: string;
    purpose: string; source: string; agent: string; priority: string; status: string;
  }) {
    if (editingLead) {
      leadsStore.updateLead(editingLead.id, {
        name: values.name,
        phone: values.phone,
        email: values.email,
        location: values.location,
        budgetMin: Number(values.budgetMin) || editingLead.budgetMin,
        budgetMax: Number(values.budgetMax) || editingLead.budgetMax,
        propertyType: values.propertyType,
        purpose: values.purpose as Lead["purpose"],
        source: values.source,
        agent: values.agent,
        priority: values.priority as Lead["priority"],
        status: values.status as LeadStatus,
      });
      toast.success("Lead updated", { description: `${values.name}'s details were saved.` });
    } else {
      const nowIso = new Date().toISOString();
      const budgetMin = Number(values.budgetMin) || 10_000_000;
      const newLead: Lead = {
        id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
        name: values.name,
        phone: values.phone,
        email: values.email,
        location: values.location,
        budgetMin,
        budgetMax: Number(values.budgetMax) || budgetMin + 5_000_000,
        propertyType: values.propertyType,
        purpose: values.purpose as Lead["purpose"],
        source: values.source,
        agent: values.agent,
        priority: values.priority as Lead["priority"],
        status: values.status as LeadStatus,
        createdAt: nowIso,
        lastContact: nowIso,
        bedrooms: 3,
        bathrooms: 2,
        areaRequired: "10 Marla",
        possession: "Ready to Move",
        facing: "North",
        parking: 1,
        amenities: [],
      };
      leadsStore.addLead(newLead);
      toast.success("Lead added", { description: `${values.name} was added to your pipeline.` });
    }
  }

  function handleDeleteConfirmed() {
    if (deleteTarget === "bulk") {
      const count = selected.size;
      leadsStore.deleteLeads(selected);
      setSelected(new Set());
      toast.success(`${count} lead${count === 1 ? "" : "s"} deleted`);
    } else if (deleteTarget) {
      leadsStore.deleteLead(deleteTarget);
      toast.success("Lead deleted");
    }
    setDeleteTarget(null);
  }

  function bulkChangeStatus(status: LeadStatus) {
    leadsStore.changeStatusBulk(selected, status);
    toast.success(`Moved ${selected.size} lead${selected.size === 1 ? "" : "s"} to ${status}`);
    setSelected(new Set());
  }

  function bulkAssignAgent(agent: string) {
    leadsStore.assignAgentBulk(selected, agent);
    toast.success(`Assigned ${selected.size} lead${selected.size === 1 ? "" : "s"} to ${agent}`);
    setSelected(new Set());
  }

  function bulkExport() {
    const rows = leads
      .filter((l) => selected.has(l.id))
      .map((l) => ({
        id: l.id, name: l.name, phone: l.phone, email: l.email,
        location: l.location, budgetMin: l.budgetMin, budgetMax: l.budgetMax,
        propertyType: l.propertyType, purpose: l.purpose, source: l.source,
        agent: l.agent, priority: l.priority, status: l.status,
      }));
    exportToCsv(`leads-export-${Date.now()}.csv`, rows);
    toast.success(`Exported ${rows.length} leads to CSV`);
  }

  function bulkMerge() {
    const ids = Array.from(selected);
    if (ids.length !== 2) return;
    const [keepId, mergeId] = ids;
    const keep = leads.find((l) => l.id === keepId);
    leadsStore.mergeLeads(keepId, mergeId);
    toast.success(`Merged leads into ${keep?.name ?? "primary lead"}`);
    setSelected(new Set());
  }

  const allOnPageSelected =
    paginated.length > 0 && paginated.every((l) => selected.has(l.id));

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Leads"
        description="Manage and track every lead across your sales pipeline."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Leads" }]}
        actions={
          <>
            {duplicateCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => setDupesOpen(true)}>
                <Copy />
                {duplicateCount} duplicates
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload />
              Import CSV
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingLead(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              New Lead
            </Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads…"
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1); }}
          items={withAll("All Statuses", statuses)}
        >
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(v) => { setPriorityFilter(v ?? "all"); setPage(1); }}
          items={withAll("All Priorities", priorities)}
        >
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="size-3.5" />
                More Filters
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }
          />
          <PopoverContent className="w-72" align="start">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Assigned Agent</span>
                <Select
                  value={agentFilter}
                  onValueChange={(v) => setAgentFilter(v ?? "all")}
                  items={withAll("All Agents", agentsList)}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {agentsList.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Lead Source</span>
                <Select
                  value={sourceFilter}
                  onValueChange={(v) => setSourceFilter(v ?? "all")}
                  items={withAll("All Sources", sourcesList)}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {sourcesList.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Property Type</span>
                <Select
                  value={typeFilter}
                  onValueChange={(v) => setTypeFilter(v ?? "all")}
                  items={withAll("All Types", propertyTypesList)}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {propertyTypesList.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setAgentFilter("all"); setSourceFilter("all"); setTypeFilter("all");
                }}>
                  <X className="size-3.5" />
                  Clear filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant={favoritesOnly ? "secondary" : "outline"}
          size="sm"
          onClick={() => { setFavoritesOnly((v) => !v); setPage(1); }}
        >
          <Star className={cn("size-3.5", favoritesOnly && "fill-warning text-warning")} />
          Favorites
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                <Bookmark className="size-3.5" />
                Saved
                {savedFilters.length > 0 && (
                  <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-muted text-[10px]">
                    {savedFilters.length}
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={saveCurrentFilter}>
              <Save />
              Save current view
            </DropdownMenuItem>
            {savedFilters.length > 0 && <DropdownMenuSeparator />}
            {savedFilters.map((f) => (
              <DropdownMenuItem
                key={f.id}
                onClick={() => applySavedFilter(f)}
                className="group/sf justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Bookmark className="size-3.5" />
                  {f.name}
                </span>
                <button
                  className="opacity-0 transition-opacity group-hover/sf:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    persistSavedFilters(savedFilters.filter((x) => x.id !== f.id));
                  }}
                >
                  <X className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(statusFilter !== "all" || priorityFilter !== "all" || activeFilterCount > 0 || search || favoritesOnly) && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
            Reset all
          </Button>
        )}

        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} lead{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-accent/40 px-3 py-2">
          <span className="text-sm font-medium text-foreground">
            {selected.size} selected
          </span>
          <div className="ml-1 flex flex-wrap items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm"><UserCog />Assign Agent</Button>} />
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {agentsList.map((a) => (
                  <DropdownMenuItem key={a} onClick={() => bulkAssignAgent(a)}>{a}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm">Change Status</Button>} />
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Move to</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statuses.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => bulkChangeStatus(s)}>{s}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Emailing ${selected.size} lead${selected.size === 1 ? "" : "s"}…`)}
            >
              <Mail />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Calling initiated for ${selected.size} lead${selected.size === 1 ? "" : "s"}`)}
            >
              <Phone />
              Call
            </Button>
            <Button variant="outline" size="sm" onClick={bulkExport}>
              <Download />
              Export
            </Button>
            <Button variant="outline" size="sm" disabled={selected.size !== 2} onClick={bulkMerge}>
              <Merge />
              Merge
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteTarget("bulk")}>
              <Trash2 />
              Delete
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/70 glass">
        {loading ? (
          <TableSkeleton rows={8} columns={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No leads match your filters"
            description="Try adjusting your search or filters, or add a new lead to get started."
            action={
              <Button size="sm" variant="outline" onClick={resetFilters}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-4">
                    <Checkbox checked={allOnPageSelected} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((lead) => (
                  <TableRow key={lead.id} data-state={selected.has(lead.id) ? "selected" : undefined}>
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selected.has(lead.id)}
                        onCheckedChange={() => toggleSelect(lead.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => leadsStore.toggleFavorite(lead.id)}
                          className="shrink-0 text-muted-foreground transition-colors hover:text-warning"
                          aria-label={lead.favorite ? "Unstar lead" : "Star lead"}
                        >
                          <Star className={cn("size-4", lead.favorite && "fill-warning text-warning")} />
                        </button>
                        <div className="flex flex-col">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {lead.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">{lead.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.location}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrencyPKR(lead.budgetMin)}–{formatCurrencyPKR(lead.budgetMax)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.propertyType}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {lead.agent.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{lead.agent}</span>
                      </div>
                    </TableCell>
                    <TableCell><PriorityBadge priority={lead.priority} /></TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/leads/${lead.id}`} />}>
                            <Eye />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingLead(lead); setFormOpen(true); }}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Emailing ${lead.name}…`)}>
                            <Mail />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Calling ${lead.name}…`)}>
                            <Phone />
                            Call
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(lead.id)}>
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

      <LeadFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editingLead}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget === "bulk" ? `Delete ${selected.size} leads?` : "Delete this lead?"}
        description="This action cannot be undone. The lead's history and notes will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirmed}
      />

      <CsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={(imported) => {
          imported.forEach((l) => leadsStore.addLead(l));
          toast.success(`Imported ${imported.length} lead${imported.length === 1 ? "" : "s"}`);
        }}
      />

      <DuplicatesDialog open={dupesOpen} onOpenChange={setDupesOpen} leads={leads} />
    </div>
  );
}
