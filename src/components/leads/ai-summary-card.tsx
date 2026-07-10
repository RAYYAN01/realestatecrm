"use client";

import * as React from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generateLeadSummary, simulateLatency } from "@/lib/ai";
import type { Lead, TimelineEvent } from "@/lib/mock-data";

export function AiSummaryCard({
  lead,
  timeline,
}: {
  lead: Lead;
  timeline: TimelineEvent[];
}) {
  const [summary, setSummary] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function run() {
    setLoading(true);
    setSummary(null);
    await simulateLatency();
    setSummary(generateLeadSummary(lead, timeline));
    setLoading(false);
  }

  return (
    <Card className="gap-3 border-primary/25 bg-gradient-to-br from-primary/[0.06] to-transparent p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-semibold text-foreground">AI Lead Summary</span>
        </div>
        {summary && !loading && (
          <Button variant="ghost" size="icon-sm" onClick={run} aria-label="Regenerate">
            <RefreshCw className="size-3.5" />
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-[92%]" />
          <Skeleton className="h-3.5 w-[78%]" />
        </div>
      ) : summary ? (
        <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Generate an instant summary of this lead&apos;s profile, engagement and recommended next step.
          </p>
          <div>
            <Button size="sm" onClick={run}>
              <Sparkles />
              Generate summary
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
