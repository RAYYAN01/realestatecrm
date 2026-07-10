"use client";

import * as React from "react";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function parseCsv(text: string): Lead[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (name: string) => headers.indexOf(name);

  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map((c) => c.trim());
    const get = (name: string, fallback = "") => {
      const j = idx(name);
      return j >= 0 ? cols[j] ?? fallback : fallback;
    };
    const nowIso = new Date().toISOString();
    const budgetMin = Number(get("budgetmin")) || 10_000_000;
    return {
      id: `LD-${Math.floor(1000 + Math.random() * 9000)}-${i}`,
      name: get("name", `Imported Lead ${i + 1}`),
      phone: get("phone", "+91 90000 00000"),
      email: get("email", ""),
      location: get("location", "Lahore"),
      budgetMin,
      budgetMax: Number(get("budgetmax")) || budgetMin + 5_000_000,
      propertyType: get("propertytype", "Apartment"),
      purpose: (get("purpose", "Buy") as Lead["purpose"]) || "Buy",
      source: get("source", "CSV Import"),
      agent: get("agent", "Sara Ahmed"),
      priority: (get("priority", "Medium") as Lead["priority"]) || "Medium",
      status: (get("status", "New") as Lead["status"]) || "New",
      createdAt: nowIso,
      lastContact: nowIso,
      bedrooms: Number(get("bedrooms")) || 3,
      bathrooms: Number(get("bathrooms")) || 2,
      areaRequired: get("arearequired", "10 Marla"),
      possession: "Ready to Move",
      facing: get("facing", "North"),
      parking: 1,
      amenities: [],
    };
  });
}

export function CsvImportDialog({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (leads: Lead[]) => void;
}) {
  const [parsed, setParsed] = React.useState<Lead[]>([]);
  const [fileName, setFileName] = React.useState("");
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setParsed([]); setFileName(""); setDragging(false); }
  }

  function handleFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setParsed(parseCsv(String(reader.result ?? "")));
    reader.readAsText(file);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns like name, phone, email, location, budgetMin, budgetMax, status.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
            )}
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <UploadCloud className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drop your CSV here, or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">Only .csv files are supported</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {fileName && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              <FileText className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate text-foreground">{fileName}</span>
              {parsed.length > 0 && (
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="size-4" />
                  {parsed.length} rows
                </span>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={parsed.length === 0}
            onClick={() => { onImport(parsed); onOpenChange(false); }}
          >
            Import {parsed.length > 0 ? `${parsed.length} leads` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
