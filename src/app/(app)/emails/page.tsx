"use client";

import * as React from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  PenSquare,
  Star,
  Paperclip,
  Send,
  Mail,
  Inbox as InboxIcon,
  FileEdit,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { emailThreads as initialThreads, type EmailThread } from "@/lib/mock-data";
import { generateEmailDraft, simulateLatency } from "@/lib/ai";
import { cn } from "@/lib/utils";

const folders: EmailThread["folder"][] = ["Inbox", "Sent", "Drafts"];

export default function EmailsPage() {
  const [threads, setThreads] = React.useState<EmailThread[]>(initialThreads);
  const [folder, setFolder] = React.useState<EmailThread["folder"]>("Inbox");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [reply, setReply] = React.useState("");

  // Compose form (controlled so the AI drafter can populate it)
  const [composeTo, setComposeTo] = React.useState("");
  const [composeSubject, setComposeSubject] = React.useState("");
  const [composeBody, setComposeBody] = React.useState("");
  const [aiDrafting, setAiDrafting] = React.useState(false);

  const [wasComposeOpen, setWasComposeOpen] = React.useState(composeOpen);
  if (composeOpen !== wasComposeOpen) {
    setWasComposeOpen(composeOpen);
    if (composeOpen) { setComposeTo(""); setComposeSubject(""); setComposeBody(""); }
  }

  async function draftWithAi() {
    setAiDrafting(true);
    await simulateLatency();
    const recipient = composeTo.split("@")[0]?.replace(/[._]/g, " ").trim();
    const draft = generateEmailDraft({
      recipient: recipient ? recipient.replace(/\b\w/g, (c) => c.toUpperCase()) : undefined,
      topic: composeSubject || "your property search",
      tone: "Professional",
    });
    setComposeSubject(draft.subject);
    setComposeBody(draft.body);
    setAiDrafting(false);
    toast.success("AI draft ready — review before sending");
  }

  const folderThreads = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return threads
      .filter((t) => t.folder === folder)
      .filter((t) => !q || t.subject.toLowerCase().includes(q) || t.from.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [threads, folder, search]);

  const selected = threads.find((t) => t.id === selectedId) ?? folderThreads[0] ?? null;

  const [lastOpenId, setLastOpenId] = React.useState<string | null>(selected?.id ?? null);
  if ((selected?.id ?? null) !== lastOpenId) {
    setLastOpenId(selected?.id ?? null);
    setReply("");
  }

  function toggleStar(id: string) {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t)));
  }

  function markRead(id: string) {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, read: true } : t)));
  }

  function sendReply() {
    if (!reply.trim() || !selected) return;
    toast.success("Reply sent", { description: `Your reply to ${selected.from} was sent.` });
    setReply("");
  }

  const unreadCount = threads.filter((t) => t.folder === "Inbox" && !t.read).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Emails"
        description="A dedicated inbox for lead and client communication."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Emails" }]}
        actions={
          <Button size="sm" onClick={() => setComposeOpen(true)}>
            <PenSquare />
            Compose
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_360px_1fr]">
        {/* Folder nav */}
        <div className="flex flex-col gap-4 rounded-xl border border-border/70 glass p-3">
          <nav className="flex flex-col gap-1">
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => { setFolder(f); setSelectedId(null); }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                  folder === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-2">
                  {f === "Inbox" && <InboxIcon className="size-4" />}
                  {f === "Sent" && <Send className="size-4" />}
                  {f === "Drafts" && <FileEdit className="size-4" />}
                  {f}
                </span>
                {f === "Inbox" && unreadCount > 0 && (
                  <Badge className="h-5 min-w-5 px-1">{unreadCount}</Badge>
                )}
              </button>
            ))}
          </nav>
          <Separator />
          <div className="flex flex-col gap-1">
            <p className="px-2.5 text-xs font-medium text-muted-foreground">More</p>
            <button
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
              onClick={() => toast.info("Templates library coming right up")}
            >
              <FileEdit className="size-4" />
              Templates
            </button>
            <button
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
              onClick={() => toast.info("Open-rate tracking coming right up")}
            >
              <BarChart3 className="size-4" />
              Tracking &amp; Open Rate
            </button>
          </div>
        </div>

        {/* Thread list */}
        <div className="flex flex-col gap-3 rounded-xl border border-border/70 glass p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search mail…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col overflow-y-auto">
            {folderThreads.length === 0 ? (
              <EmptyState icon={Mail} title="No emails here" description="This folder is empty." className="border-none py-10" />
            ) : (
              folderThreads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedId(t.id); markRead(t.id); }}
                  className={cn(
                    "flex flex-col gap-1 border-b border-border/60 px-2.5 py-2.5 text-left transition-colors last:border-b-0 hover:bg-muted/60",
                    selected?.id === t.id && "bg-accent/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm", !t.read ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                      {t.from}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(t.timestamp), { addSuffix: false })}
                    </span>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">{t.subject}</span>
                  <span className="truncate text-xs text-muted-foreground/70">{t.preview}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Reading pane */}
        <div className="flex flex-col rounded-xl border border-border/70 glass p-4">
          {!selected ? (
            <EmptyState icon={Mail} title="Select an email" description="Choose an email from the list to read it here." className="my-auto border-none" />
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{selected.subject}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    From <span className="font-medium text-foreground">{selected.from}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => toggleStar(selected.id)}
                >
                  <Star className={cn("size-4", selected.starred && "fill-warning text-warning")} />
                </Button>
              </div>
              <Separator />
              <p className="flex-1 text-sm leading-relaxed text-foreground/90">{selected.body}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Paperclip className="size-3.5" />
                No attachments
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder={`Reply to ${selected.from}…`}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="min-h-24"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={sendReply} disabled={!reply.trim()}>
                    <Send />
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Email</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="compose-to">To</Label>
              <Input id="compose-to" placeholder="recipient@example.com" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="compose-subject">Subject</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-primary hover:text-primary"
                  onClick={draftWithAi}
                  disabled={aiDrafting}
                >
                  <Sparkles className={cn("size-3.5", aiDrafting && "animate-pulse")} />
                  {aiDrafting ? "Drafting…" : "Draft with AI"}
                </Button>
              </div>
              <Input id="compose-subject" placeholder="Email subject" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="compose-body">Message</Label>
              <Textarea id="compose-body" placeholder="Write your message… or let AI draft it for you" className="min-h-40" value={composeBody} onChange={(e) => setComposeBody(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setComposeOpen(false);
                toast.success("Email sent");
              }}
            >
              <Send />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
