"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  Plus,
  CalendarClock,
  MoreHorizontal,
  Video,
  XCircle,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { type Meeting } from "@/lib/mock-data";
import { useActivities, activitiesStore } from "@/lib/store/activities-store";
import { MeetingFormDialog } from "@/components/meetings/meeting-form-dialog";
import { cn } from "@/lib/utils";

const statusStyles: Record<Meeting["status"], string> = {
  Scheduled: "bg-info/10 text-info",
  Completed: "bg-success/10 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
};

export default function MeetingsPage() {
  const { meetings } = useActivities();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [formOpen, setFormOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return meetings.filter((m) => {
      if (q && !(m.title.toLowerCase().includes(q) || m.leadName.toLowerCase().includes(q))) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      return true;
    });
  }, [meetings, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  function setStatus(id: string, status: Meeting["status"]) {
    activitiesStore.setMeetingStatus(id, status);
    toast.success(`Meeting marked as ${status}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Meetings"
        description="Site visits, negotiations and consultations with your leads."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Meetings" }]}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus />
            Schedule Meeting
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings…"
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1); }}
          items={{ all: "All Statuses", Scheduled: "Scheduled", Completed: "Completed", Cancelled: "Cancelled" }}
        >
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} meeting{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="rounded-xl border border-border/70 glass">
        {loading ? (
          <TableSkeleton rows={7} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No meetings found" description="Schedule a meeting to see it appear here." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Meeting</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Date &amp; Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-4 font-medium text-foreground">{m.title}</TableCell>
                    <TableCell>
                      {m.leadId ? (
                        <Link href={`/leads/${m.leadId}`} className="text-muted-foreground hover:text-primary hover:underline">
                          {m.leadName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{m.leadName}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(m.date), "dd MMM yyyy")} · {m.time}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" />
                        {m.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {m.participants.map((p, i) => (
                          <Avatar key={`${p}-${i}`} className="size-6 ring-2 ring-card">
                            <AvatarFallback className="text-[10px]">
                              {p.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="ghost" className={cn("border-0 font-medium", statusStyles[m.status])}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.success("Joining meeting…")}>
                            <Video />
                            Join
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatus(m.id, "Completed")}>
                            <RotateCcw />
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setStatus(m.id, "Cancelled")}>
                            <XCircle />
                            Cancel
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

      <MeetingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(values) => {
          activitiesStore.addMeeting(values);
          toast.success("Meeting scheduled", { description: `${values.title} · ${values.time}` });
        }}
      />
    </div>
  );
}
