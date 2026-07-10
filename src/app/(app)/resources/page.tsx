"use client";

import * as React from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  FileText,
  Video,
  File,
  Download,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resources as allResources, type Resource } from "@/lib/mock-data";

const categories: Resource["category"][] = [
  "Sales Scripts",
  "Property Documents",
  "Company Policies",
  "Training Material",
  "FAQs",
  "Price Sheets",
  "Contracts",
  "Checklists",
];

const typeIcon: Record<Resource["type"], React.ElementType> = {
  PDF: FileText,
  Video: Video,
  Doc: File,
};

export default function ResourcesPage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<Resource["category"] | "all">("all");

  const filtered = allResources.filter((r) => {
    const q = search.trim().toLowerCase();
    if (q && !(r.title.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q)))) return false;
    if (category !== "all" && r.category !== category) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Resources"
        description="Your team's knowledge base — scripts, documents, policies and training material."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Resources" }]}
      />

      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search resources or tags…"
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        {/* Category sidebar */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition-colors",
              category === "all" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            )}
          >
            All Resources
            <Badge variant="secondary" className="ml-2">{allResources.length}</Badge>
          </button>
          {categories.map((c) => {
            const count = allResources.filter((r) => r.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition-colors",
                  category === c ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {c}
                <Badge variant="secondary" className="ml-2">{count}</Badge>
              </button>
            );
          })}
        </div>

        {/* Resource grid */}
        {filtered.length === 0 ? (
          <EmptyState icon={BookOpen} title="No resources found" description="Try a different search term or category." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => {
              const Icon = typeIcon[r.type];
              return (
                <Card key={r.id} className="gap-3 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4.5" />
                    </div>
                    <Badge variant="outline">{r.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.category}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Updated {format(new Date(r.updatedAt), "dd MMM yyyy")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toast.success(`Downloading "${r.title}"`)}
                    >
                      <Download className="size-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
