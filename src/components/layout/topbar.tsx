"use client";

import { CalendarDays, Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/60 px-4 backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-background/45">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      <div className="flex flex-1 items-center">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground"
              >
                <CalendarDays className="size-4.5" />
                <span className="sr-only">Calendar</span>
              </Button>
            }
          />
          <TooltipContent>Calendar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-primary"
              >
                <Sparkles className="size-4.5" />
                <span className="sr-only">AI Assistant</span>
              </Button>
            }
          />
          <TooltipContent>AI Assistant</TooltipContent>
        </Tooltip>

        <NotificationsMenu />
        <ThemeToggle />

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <ProfileMenu />
      </div>
    </header>
  );
}
