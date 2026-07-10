"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

const navChords: Record<string, string> = {
  d: "/dashboard",
  l: "/leads",
  p: "/pipeline",
  r: "/prospects",
  c: "/clients",
  t: "/tasks",
  m: "/meetings",
  s: "/settings",
};

const shortcutGroups: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: "Navigation",
    items: [
      { keys: ["G", "D"], label: "Go to Dashboard" },
      { keys: ["G", "L"], label: "Go to Leads" },
      { keys: ["G", "P"], label: "Go to Pipeline" },
      { keys: ["G", "R"], label: "Go to Prospects" },
      { keys: ["G", "C"], label: "Go to Clients" },
      { keys: ["G", "T"], label: "Go to Tasks" },
      { keys: ["G", "M"], label: "Go to Meetings" },
      { keys: ["G", "S"], label: "Go to Settings" },
    ],
  },
  {
    title: "Actions",
    items: [
      { keys: ["⌘", "K"], label: "Open global search" },
      { keys: ["N"], label: "New lead" },
      { keys: ["?"], label: "Show this help" },
    ],
  },
];

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = React.useState(false);
  const chordRef = React.useRef<{ key: string; at: number } | null>(null);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      // Chord: "g" then a nav key
      const pending = chordRef.current;
      if (pending && pending.key === "g" && Date.now() - pending.at < 1500) {
        const dest = navChords[e.key.toLowerCase()];
        chordRef.current = null;
        if (dest) {
          e.preventDefault();
          router.push(dest);
          return;
        }
      }

      if (e.key === "g") {
        chordRef.current = { key: "g", at: Date.now() };
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        router.push("/leads?new=1");
        return;
      }

      chordRef.current = null;
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Work faster with these keyboard shortcuts.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-5 py-2 sm:grid-cols-2">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </p>
              <div className="flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className="flex items-center gap-1">
                      {item.keys.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
