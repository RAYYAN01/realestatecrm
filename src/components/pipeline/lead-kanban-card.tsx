"use client";

import Link from "next/link";
import {
  MapPin,
  Wallet,
  Home,
  Clock,
  MoreHorizontal,
  Eye,
  Phone,
  Mail,
  CalendarPlus,
  ListPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/shared/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrencyPKR, type Lead } from "@/lib/mock-data";
import { leadsStore } from "@/lib/store/leads-store";
import { cn } from "@/lib/utils";

export function LeadKanbanCard({
  lead,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  dragging?: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab gap-2.5 p-3 transition-shadow active:cursor-grabbing hover:ring-foreground/20",
        dragging && "opacity-40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/leads/${lead.id}`}
          className="text-sm font-medium text-foreground hover:text-primary hover:underline"
        >
          {lead.name}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-xs" className="shrink-0"><MoreHorizontal /></Button>}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/leads/${lead.id}`} />}>
              <Eye />
              Open lead
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => leadsStore.logInteraction(lead.id, "call", "Call logged", `Call to ${lead.name}.`)}>
              <Phone />
              Call
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => leadsStore.logInteraction(lead.id, "email", "Email sent", `Email to ${lead.name}.`)}>
              <Mail />
              Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { leadsStore.logInteraction(lead.id, "meeting", "Meeting scheduled", `Meeting with ${lead.name}.`); toast.success("Meeting scheduled"); }}>
              <CalendarPlus />
              Schedule meeting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Task assigned")}>
              <ListPlus />
              Assign task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Wallet className="size-3.5 shrink-0" />
          {formatCurrencyPKR(lead.budgetMin)}–{formatCurrencyPKR(lead.budgetMax)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" />
          {lead.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Home className="size-3.5 shrink-0" />
          {lead.propertyType}
        </span>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          <Avatar className="size-5">
            <AvatarFallback className="text-[9px]">
              {lead.agent.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <PriorityBadge priority={lead.priority} />
        </div>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {formatDistanceToNow(new Date(lead.lastContact), { addSuffix: false })}
        </span>
      </div>
    </Card>
  );
}
