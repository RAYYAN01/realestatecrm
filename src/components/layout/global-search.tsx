"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  UserSearch,
  Building2,
  ListChecks,
  CalendarClock,
  LayoutDashboard,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { leads } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        className="h-9 w-full max-w-sm justify-start gap-2 bg-background px-3 text-sm font-normal text-muted-foreground shadow-none"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search leads, clients, tasks…</span>
        <Kbd>⌘K</Kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search leads, clients, tasks, resources…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => go("/dashboard")}>
              <LayoutDashboard />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => go("/leads")}>
              <Target />
              Leads
            </CommandItem>
            <CommandItem onSelect={() => go("/prospects")}>
              <UserSearch />
              Prospects
            </CommandItem>
            <CommandItem onSelect={() => go("/clients")}>
              <Building2 />
              Clients
            </CommandItem>
            <CommandItem onSelect={() => go("/tasks")}>
              <ListChecks />
              Tasks
            </CommandItem>
            <CommandItem onSelect={() => go("/meetings")}>
              <CalendarClock />
              Meetings
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Leads">
            {leads.slice(0, 6).map((lead) => (
              <CommandItem
                key={lead.id}
                onSelect={() => go(`/leads?highlight=${lead.id}`)}
              >
                <Target />
                <span>{lead.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {lead.location}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
