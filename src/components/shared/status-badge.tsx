import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus, Priority } from "@/lib/mock-data";

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-info/10 text-info dark:bg-info/15",
  Contacted: "bg-chart-5/10 text-chart-5 dark:bg-chart-5/15",
  Interested: "bg-chart-2/10 text-chart-2 dark:bg-chart-2/15",
  Qualified: "bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-warning",
  Negotiation: "bg-chart-4/10 text-chart-4 dark:bg-chart-4/15",
  Won: "bg-success/10 text-success dark:bg-success/15",
  Lost: "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="ghost" className={cn("border-0 font-medium", statusStyles[status])}>
      {status}
    </Badge>
  );
}

const priorityStyles: Record<Priority, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-warning",
  High: "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="ghost" className={cn("border-0 font-medium", priorityStyles[priority])}>
      {priority}
    </Badge>
  );
}
