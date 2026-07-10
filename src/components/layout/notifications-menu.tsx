"use client";

import * as React from "react";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifications as initialNotifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function NotificationsMenu() {
  const [items, setItems] = React.useState(initialNotifications);
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9 text-muted-foreground"
          >
            <Bell className="size-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-1.5 rounded-full bg-destructive" />
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-90 p-0">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              onClick={() =>
                setItems((prev) => prev.map((n) => ({ ...n, read: true })))
              }
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-90 overflow-y-auto">
          {items.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex cursor-default gap-2.5 border-b border-border/60 px-3.5 py-3 text-sm last:border-b-0 hover:bg-muted/60",
                !n.read && "bg-accent/40"
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  n.read ? "bg-transparent" : "bg-primary"
                )}
              />
              <div className="flex-1 space-y-0.5">
                <p className="font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.description}</p>
                <p className="text-[11px] text-muted-foreground/70">
                  {formatDistanceToNow(new Date(n.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
