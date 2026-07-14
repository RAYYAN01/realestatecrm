"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  isSameMonth,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ListChecks,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MeetingFormDialog } from "@/components/meetings/meeting-form-dialog";
import { useActivities, activitiesStore } from "@/lib/store/activities-store";
import type { Meeting, Task } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const meetingStatusStyles: Record<Meeting["status"], string> = {
  Scheduled: "bg-info/10 text-info",
  Completed: "bg-success/10 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
};

const taskStatusStyles: Record<Task["status"], string> = {
  "To Do": "bg-muted text-muted-foreground",
  "In Progress": "bg-warning/10 text-warning",
  Done: "bg-success/10 text-success",
};

function dayKey(d: Date | string) {
  return format(new Date(d), "yyyy-MM-dd");
}

export default function CalendarPage() {
  const { meetings, tasks } = useActivities();

  const [cursor, setCursor] = React.useState<Date>(() => startOfMonth(new Date()));
  const [selected, setSelected] = React.useState<string>(() => dayKey(new Date()));
  const [formOpen, setFormOpen] = React.useState(false);

  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, { meetings: Meeting[]; tasks: Task[] }>();
    const bucket = (key: string) => {
      let b = map.get(key);
      if (!b) {
        b = { meetings: [], tasks: [] };
        map.set(key, b);
      }
      return b;
    };
    for (const m of meetings) bucket(dayKey(m.date)).meetings.push(m);
    for (const t of tasks) {
      if (!t.dueDate) continue;
      bucket(dayKey(t.dueDate)).tasks.push(t);
    }
    return map;
  }, [meetings, tasks]);

  const days = React.useMemo(() => {
    if (!cursor) return [];
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(cursor)),
      end: endOfWeek(endOfMonth(cursor)),
    });
  }, [cursor]);

  const selectedDate = selected ? new Date(selected) : null;
  const selectedEvents = selected
    ? eventsByDay.get(selected) ?? { meetings: [], tasks: [] }
    : { meetings: [], tasks: [] };

  const monthMeetings = React.useMemo(() => {
    if (!cursor) return 0;
    return meetings.filter((m) => isSameMonth(new Date(m.date), cursor)).length;
  }, [meetings, cursor]);

  function setMeetingStatus(id: string, status: Meeting["status"]) {
    activitiesStore.setMeetingStatus(id, status);
    toast.success(`Meeting marked as ${status}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Calendar"
        description="Your meetings and task deadlines across the month."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Calendar" }]}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus />
            Schedule Meeting
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        {/* Calendar grid ---------------------------------------------------- */}
        <div className="rounded-xl border border-border/70 glass p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {cursor ? format(cursor, "MMMM yyyy") : " "}
              </h2>
              {cursor && (
                <span className="text-sm text-muted-foreground">
                  · {monthMeetings} meeting{monthMeetings === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setCursor(startOfMonth(today));
                  setSelected(dayKey(today));
                }}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Previous month"
                onClick={() => cursor && setCursor(addMonths(cursor, -1))}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Next month"
                onClick={() => cursor && setCursor(addMonths(cursor, 1))}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="pb-2 text-center text-xs font-medium text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const key = dayKey(day);
              const b = eventsByDay.get(key);
              const inMonth = cursor ? isSameMonth(day, cursor) : true;
              const isSelected = selected === key;
              const today = isToday(day);
              const meetingCount = b?.meetings.length ?? 0;
              const taskCount = b?.tasks.length ?? 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={cn(
                    "flex min-h-[4.75rem] flex-col rounded-lg border border-transparent p-1.5 text-left transition-colors hover:border-border hover:bg-muted/50",
                    !inMonth && "opacity-40",
                    isSelected && "border-primary/60 bg-primary/5 hover:border-primary/60"
                  )}
                >
                  <span
                    className={cn(
                      "mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                      today
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {b?.meetings.slice(0, 2).map((m) => (
                      <span
                        key={m.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight",
                          meetingStatusStyles[m.status]
                        )}
                        title={m.title}
                      >
                        {m.time.replace(/:00/, "")} {m.title}
                      </span>
                    ))}
                    {meetingCount + taskCount > (b?.meetings.slice(0, 2).length ?? 0) && (
                      <span className="px-1 text-[10px] text-muted-foreground">
                        {taskCount > 0 && `${taskCount} task${taskCount === 1 ? "" : "s"}`}
                        {taskCount > 0 && meetingCount > 2 && " · "}
                        {meetingCount > 2 && `+${meetingCount - 2} more`}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day panel ---------------------------------------------- */}
        <div className="rounded-xl border border-border/70 glass p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                {selectedDate ? format(selectedDate, "EEEE") : " "}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedDate ? format(selectedDate, "dd MMM yyyy") : " "}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Schedule meeting on this day"
              onClick={() => setFormOpen(true)}
            >
              <Plus />
            </Button>
          </div>

          {selectedEvents.meetings.length === 0 && selectedEvents.tasks.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Nothing scheduled"
              description="No meetings or tasks on this day."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {selectedEvents.meetings.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CalendarClock className="size-3.5" /> Meetings
                  </span>
                  {selectedEvents.meetings.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-border/70 bg-card/50 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {m.title}
                          </p>
                          {m.leadId ? (
                            <Link
                              href={`/leads/${m.leadId}`}
                              className="text-xs text-muted-foreground hover:text-primary hover:underline"
                            >
                              {m.leadName}
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">{m.leadName}</span>
                          )}
                        </div>
                        <Badge
                          variant="ghost"
                          className={cn("shrink-0 border-0 font-medium", meetingStatusStyles[m.status])}
                        >
                          {m.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" /> {m.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" /> {m.location}
                        </span>
                      </div>
                      {m.status === "Scheduled" && (
                        <div className="mt-2 flex gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setMeetingStatus(m.id, "Completed")}
                          >
                            <CheckCircle2 className="size-3.5" /> Complete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive"
                            onClick={() => setMeetingStatus(m.id, "Cancelled")}
                          >
                            <XCircle className="size-3.5" /> Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedEvents.tasks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <ListChecks className="size-3.5" /> Tasks due
                  </span>
                  {selectedEvents.tasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-border/70 bg-card/50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.assignedTo}</p>
                      </div>
                      <Badge
                        variant="ghost"
                        className={cn("shrink-0 border-0 font-medium", taskStatusStyles[t.status])}
                      >
                        {t.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <MeetingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultDate={selected ?? undefined}
        onSubmit={(values) => {
          activitiesStore.addMeeting(values);
          toast.success("Meeting scheduled", { description: `${values.title} · ${values.time}` });
        }}
      />
    </div>
  );
}
