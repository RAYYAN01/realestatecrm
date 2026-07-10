"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/lib/store/leads-store";
import { cn } from "@/lib/utils";

export function LeadCombobox({
  value,
  onChange,
  placeholder = "Select a lead…",
}: {
  value?: string;
  onChange: (leadId: string, leadName: string) => void;
  placeholder?: string;
}) {
  const { leads } = useLeads();
  const [open, setOpen] = React.useState(false);
  const selected = leads.find((l) => l.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
            aria-expanded={open}
          >
            <span className={cn(!selected && "text-muted-foreground")}>
              {selected ? selected.name : placeholder}
            </span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search leads…" />
          <CommandList>
            <CommandEmpty>No lead found.</CommandEmpty>
            <CommandGroup>
              {leads.map((lead) => (
                <CommandItem
                  key={lead.id}
                  value={`${lead.name} ${lead.id}`}
                  onSelect={() => {
                    onChange(lead.id, lead.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === lead.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1">{lead.name}</span>
                  <span className="text-xs text-muted-foreground">{lead.location}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
