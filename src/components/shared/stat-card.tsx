import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; direction: "up" | "down"; positive?: boolean };
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
}) {
  const toneStyles: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground dark:text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="gap-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:ring-foreground/[0.14]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div
          className={cn(
            "flex size-7 items-center justify-center rounded-lg ring-1 ring-inset ring-foreground/[0.06]",
            toneStyles[tone]
          )}
        >
          <Icon className="size-3.5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[1.6rem] font-semibold leading-none tracking-tight tabular-nums text-foreground">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.positive === false ? "text-destructive" : "text-success"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>
    </Card>
  );
}
