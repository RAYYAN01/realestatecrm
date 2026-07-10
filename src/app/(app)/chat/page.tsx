"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Search,
  Send,
  Paperclip,
  Mic,
  Users,
  Pin,
  Check,
  CheckCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  chatConversations as initialConversations,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

export default function ChatPage() {
  const [conversations, setConversations] = React.useState<ChatConversation[]>(initialConversations);
  const [activeId, setActiveId] = React.useState(initialConversations[0]?.id ?? "");
  const [search, setSearch] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [active?.messages.length, typing]);

  function selectConversation(id: string) {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  }

  function sendMessage() {
    if (!draft.trim() || !active) return;
    const message: ChatMessage = {
      id: `m-${Date.now()}`,
      author: "You",
      content: draft.trim(),
      timestamp: new Date().toISOString(),
      self: true,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, messages: [...c.messages, message], lastMessage: message.content, lastMessageAt: message.timestamp }
          : c
      )
    );
    setDraft("");

    if (active.type === "direct") {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const reply: ChatMessage = {
          id: `m-${Date.now() + 1}`,
          author: active.name,
          content: "Got it, thanks for the update!",
          timestamp: new Date().toISOString(),
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === active.id
              ? { ...c, messages: [...c.messages, reply], lastMessage: reply.content, lastMessageAt: reply.timestamp }
              : c
          )
        );
      }, 1400);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Internal Chat"
        description="Message your team in real time, share files and stay in sync."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Internal Chat" }]}
      />

      <div className="grid h-[calc(100vh-13rem)] min-h-[420px] grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        {/* Conversation list */}
        <div className="flex flex-col gap-3 rounded-xl border border-border/70 glass p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search people or groups…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
            {filteredConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60",
                  active?.id === c.id && "bg-accent/50"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="size-9">
                    <AvatarFallback className={cn(c.type === "group" && "bg-primary/10 text-primary")}>
                      {c.type === "group" ? <Users className="size-4" /> : initials(c.name)}
                    </AvatarFallback>
                  </Avatar>
                  {c.type === "direct" && (
                    <span
                      className={cn(
                        "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card",
                        c.online ? "bg-success" : "bg-muted-foreground/40"
                      )}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {format(new Date(c.lastMessageAt), "hh:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">{c.lastMessage}</span>
                    {c.unread > 0 && <Badge className="h-4.5 min-w-4.5 shrink-0 px-1 text-[10px]">{c.unread}</Badge>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-col rounded-xl border border-border/70 glass">
          {!active ? (
            <EmptyState icon={Users} title="Select a conversation" description="Choose a person or group to start chatting." className="m-auto border-none" />
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarFallback className={cn(active.type === "group" && "bg-primary/10 text-primary")}>
                      {active.type === "group" ? <Users className="size-4" /> : initials(active.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{active.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {active.type === "group" ? "Group chat" : active.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <Pin className="size-4" />
                </Button>
              </div>

              <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
                {active.messages.map((m, i) => (
                  <div key={m.id} className={cn("flex flex-col gap-1", m.self ? "items-end" : "items-start")}>
                    {!m.self && active.type === "group" && (
                      <span className="px-1 text-xs font-medium text-muted-foreground">{m.author}</span>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                        m.self
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground"
                      )}
                    >
                      {m.content}
                    </div>
                    <span className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
                      {format(new Date(m.timestamp), "hh:mm a")}
                      {m.self && (i === active.messages.length - 1 ? <Check className="size-3" /> : <CheckCheck className="size-3 text-info" />)}
                    </span>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                    <span className="flex gap-0.5">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    </span>
                    {active.name} is typing…
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-border p-3">
                <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground">
                  <Paperclip className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground">
                  <Mic className="size-4" />
                </Button>
                <Input
                  placeholder={`Message ${active.name}…`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <Button size="icon" onClick={sendMessage} disabled={!draft.trim()}>
                  <Send className="size-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
