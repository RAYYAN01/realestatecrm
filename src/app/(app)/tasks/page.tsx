"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import {
  Search,
  Plus,
  ListChecks,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Circle,
  CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { PriorityBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { type Task } from "@/lib/mock-data";
import { useActivities, activitiesStore } from "@/lib/store/activities-store";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { cn } from "@/lib/utils";

const columns: Task["status"][] = ["To Do", "In Progress", "Done"];

function dueLabel(date: string) {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "dd MMM");
}

export default function TasksPage() {
  const { tasks } = useActivities();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
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
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
  }, [tasks, search, priorityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  function setStatus(id: string, status: Task["status"]) {
    activitiesStore.setTaskStatus(id, status);
  }

  function removeTask(id: string) {
    activitiesStore.deleteTask(id);
    toast.success("Task deleted");
  }

  const agendaGroups = React.useMemo(() => {
    const groups = new Map<string, Task[]>();
    [...filtered]
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .forEach((t) => {
        const key = format(new Date(t.dueDate), "yyyy-MM-dd");
        groups.set(key, [...(groups.get(key) ?? []), t]);
      });
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Tasks"
        description="Track follow-ups, reminders and to-dos across your team."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tasks" }]}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus />
            New Task
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1); }}
          items={{ all: "All Statuses", ...Object.fromEntries(columns.map((s) => [s, s])) }}
        >
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {columns.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select
          value={priorityFilter}
          onValueChange={(v) => { setPriorityFilter(v ?? "all"); setPage(1); }}
          items={{ all: "All Priorities", Low: "Low", Medium: "Medium", High: "High" }}
        >
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} task{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-3">
          <div className="rounded-xl border border-border/70 glass">
            {loading ? (
              <TableSkeleton rows={7} columns={6} />
            ) : filtered.length === 0 ? (
              <EmptyState icon={ListChecks} title="No tasks found" description="Try adjusting your search or filters." />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Related Lead</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10 pr-4" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="pl-4 font-medium text-foreground">{t.title}</TableCell>
                        <TableCell className="text-muted-foreground">{t.assignedTo}</TableCell>
                        <TableCell>
                          {t.leadId ? (
                            <Link href={`/leads/${t.leadId}`} className="text-muted-foreground hover:text-primary hover:underline">
                              {t.relatedLead}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">{t.relatedLead ?? "—"}</span>
                          )}
                        </TableCell>
                        <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                        <TableCell className={cn(
                          "text-muted-foreground",
                          isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== "Done" && "font-medium text-destructive"
                        )}>
                          {dueLabel(t.dueDate)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="ghost"
                            className={cn(
                              "border-0 font-medium",
                              t.status === "Done" && "bg-success/10 text-success",
                              t.status === "In Progress" && "bg-info/10 text-info",
                              t.status === "To Do" && "bg-muted text-muted-foreground"
                            )}
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>} />
                            <DropdownMenuContent align="end">
                              {columns.map((s) => (
                                <DropdownMenuItem key={s} onClick={() => setStatus(t.id, s)}>
                                  {s === "Done" ? <CheckCircle2 /> : <Circle />}
                                  Mark as {s}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => removeTask(t.id)}>
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
        </TabsContent>

        <TabsContent value="kanban" className="mt-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {columns.map((col) => {
              const items = filtered.filter((t) => t.status === col);
              return (
                <div key={col} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-semibold text-foreground">{col}</h3>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {items.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                        No tasks
                      </div>
                    ) : (
                      items.map((t) => (
                        <Card key={t.id} className="gap-2 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{t.title}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" className="shrink-0"><MoreHorizontal /></Button>} />
                              <DropdownMenuContent align="end">
                                {columns.filter((s) => s !== col).map((s) => (
                                  <DropdownMenuItem key={s} onClick={() => setStatus(t.id, s)}>
                                    Move to {s}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => removeTask(t.id)}>
                                  <Trash2 />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{t.assignedTo}</span>
                            <span>{dueLabel(t.dueDate)}</span>
                          </div>
                          <PriorityBadge priority={t.priority} />
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-3">
          <div className="flex flex-col gap-4">
            {agendaGroups.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Nothing scheduled" description="No tasks match your current filters." />
            ) : (
              agendaGroups.map(([date, items]) => (
                <div key={date} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    {dueLabel(date)}
                    <span className="font-normal text-muted-foreground">
                      {format(new Date(date), "EEEE, dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 pl-6">
                    {items.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/70 glass px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.title}</p>
                          <p className="text-xs text-muted-foreground">{t.assignedTo} · {t.relatedLead}</p>
                        </div>
                        <PriorityBadge priority={t.priority} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(values) => {
          activitiesStore.addTask(values);
          toast.success("Task created", { description: values.title });
        }}
      />
    </div>
  );
}
