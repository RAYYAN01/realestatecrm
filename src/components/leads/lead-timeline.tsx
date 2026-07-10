import { format } from "date-fns";
import {
  UserPlus,
  Phone,
  CalendarClock,
  Mail,
  MessageCircle,
  Home,
  Handshake,
  CheckCircle2,
  Trophy,
  XCircle,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { TimelineEvent, TimelineEventType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap: Record<TimelineEventType, LucideIcon> = {
  created: UserPlus,
  call: Phone,
  meeting: CalendarClock,
  email: Mail,
  whatsapp: MessageCircle,
  property_shared: Home,
  negotiation: Handshake,
  qualified: CheckCircle2,
  won: Trophy,
  lost: XCircle,
  note: StickyNote,
};

const toneMap: Record<TimelineEventType, string> = {
  created: "bg-info/10 text-info",
  call: "bg-chart-2/10 text-chart-2",
  meeting: "bg-chart-5/10 text-chart-5",
  email: "bg-chart-4/10 text-chart-4",
  whatsapp: "bg-success/10 text-success",
  property_shared: "bg-primary/10 text-primary",
  negotiation: "bg-warning/15 text-warning-foreground dark:text-warning",
  qualified: "bg-success/10 text-success",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
  note: "bg-muted text-muted-foreground",
};

export function LeadTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="flex flex-col gap-0">
      {events.map((event, i) => {
        const Icon = iconMap[event.type];
        return (
          <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i < events.length - 1 && (
              <span className="absolute top-9 left-[17px] h-[calc(100%-1.75rem)] w-px bg-border" />
            )}
            <div
              className={cn(
                "z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                toneMap[event.type]
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-x-2">
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                <time className="text-xs text-muted-foreground">
                  {format(new Date(event.timestamp), "dd MMM yyyy, hh:mm a")}
                </time>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">by {event.author}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
