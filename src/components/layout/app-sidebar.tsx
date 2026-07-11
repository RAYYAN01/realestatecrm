"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { primaryNav, secondaryNav } from "@/lib/nav-config";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export function AppSidebar() {
  const pathname = usePathname();
  const { email, role } = useAuth();
  const displayName = email ? email.split("@")[0].replace(/[._]/g, " ") : "Your Account";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Zap className="size-4.5 fill-current" />
          </div>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              Naaz AI Labs
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              CRM
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      tooltip={item.title}
                      className={cn(
                        "h-11 gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors duration-150",
                        isActive
                          ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="size-5!" />
                      <span>{item.title}</span>
                      {isActive && (
                        <ChevronRight className="ml-auto size-4! opacity-90 group-data-[collapsible=icon]:hidden" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {secondaryNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  tooltip={item.title}
                  className={cn(
                    "h-11 gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors duration-150",
                    isActive
                      ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="size-5!" />
                  <span>{item.title}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto size-4! opacity-90 group-data-[collapsible=icon]:hidden" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="mt-1">
              <Avatar className="size-6 rounded-md">
                <AvatarImage src="" alt={displayName} />
                <AvatarFallback className="rounded-md text-[11px] capitalize">{initials || "NA"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-xs font-medium text-sidebar-foreground capitalize">
                  {displayName}
                </span>
                <span className="text-[11px] text-sidebar-foreground/60 capitalize">
                  {role === "admin" ? "Administrator" : "Employee"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
