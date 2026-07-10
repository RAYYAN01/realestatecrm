"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Search,
  Building2,
  FileText,
  Upload,
  MessageCircle,
  Receipt,
  LifeBuoy,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clients as initialClients, formatCurrencyPKR, type Client } from "@/lib/mock-data";
import { format } from "date-fns";

export default function ClientsPage() {
  const [clients] = React.useState<Client[]>(initialClients);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [activeClient, setActiveClient] = React.useState<Client | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.propertyPurchased.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Clients"
        description="Everyone who has purchased a property through your team."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Clients" }]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients…"
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} client{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="rounded-xl border border-border/70 glass">
        {loading ? (
          <TableSkeleton rows={7} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Building2} title="No clients found" description="Try a different search term." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Client</TableHead>
                  <TableHead>Property Purchased</TableHead>
                  <TableHead>Purchase Value</TableHead>
                  <TableHead>Closing Date</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="pr-4">Support</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => setActiveClient(c)}
                  >
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-[11px]">
                            {c.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{c.name}</span>
                          <span className="text-xs text-muted-foreground">{c.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.propertyPurchased}</TableCell>
                    <TableCell className="text-muted-foreground">{formatCurrencyPKR(c.purchaseValue)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(c.closingDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.agent}</TableCell>
                    <TableCell className="pr-4">
                      {c.supportRequests > 0 ? (
                        <Badge variant="ghost" className="border-0 bg-warning/15 font-medium text-warning-foreground dark:text-warning">
                          {c.supportRequests} open
                        </Badge>
                      ) : (
                        <Badge variant="ghost" className="border-0 bg-muted font-medium text-muted-foreground">
                          None
                        </Badge>
                      )}
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

      <Sheet open={activeClient !== null} onOpenChange={(open) => !open && setActiveClient(null)}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
          {activeClient && (
            <>
              <SheetHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>
                      {activeClient.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle>{activeClient.name}</SheetTitle>
                    <SheetDescription>{activeClient.email} · {activeClient.phone}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="flex-1 gap-0 overflow-hidden">
                <TabsList className="mx-4 mt-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="flex flex-col gap-4">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-medium text-muted-foreground">Property Purchased</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{activeClient.propertyPurchased}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs font-medium text-muted-foreground">Purchase Value</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {formatCurrencyPKR(activeClient.purchaseValue)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs font-medium text-muted-foreground">Closing Date</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {format(new Date(activeClient.closingDate), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-medium text-muted-foreground">Sales Agent</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{activeClient.agent}</p>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground">Communication History</p>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="mt-0.5 size-4 shrink-0" />
                        <span>Closing confirmation email sent on {format(new Date(activeClient.closingDate), "dd MMM yyyy")}.</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="flex-1 overflow-y-auto px-4 py-4">
                  <EmptyState
                    icon={FileText}
                    title="No documents uploaded"
                    description="Sale agreements, invoices and identity documents will appear here."
                    action={
                      <Button size="sm" variant="outline" onClick={() => toast.success("Document uploaded")}>
                        <Upload />
                        Upload document
                      </Button>
                    }
                  />
                </TabsContent>

                <TabsContent value="support" className="flex-1 overflow-y-auto px-4 py-4">
                  {activeClient.supportRequests > 0 ? (
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: activeClient.supportRequests }).map((_, i) => (
                        <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border p-3">
                          <LifeBuoy className="mt-0.5 size-4 shrink-0 text-warning" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Maintenance request #{i + 1}</p>
                            <p className="text-xs text-muted-foreground">Awaiting response from support team.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Receipt} title="No open support requests" description="This client has no pending issues." />
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
