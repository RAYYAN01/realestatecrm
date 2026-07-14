import {
  LayoutDashboard,
  Target,
  KanbanSquare,
  UserSearch,
  Building2,
  ListChecks,
  CalendarClock,
  CalendarDays,
  Users,
  Phone,
  Mail,
  BookOpen,
  MessagesSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badgeCount?: number;
};

export const primaryNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", href: "/leads", icon: Target },
  { title: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { title: "Prospects", href: "/prospects", icon: UserSearch },
  { title: "Clients", href: "/clients", icon: Building2 },
  { title: "Tasks", href: "/tasks", icon: ListChecks },
  { title: "Meetings", href: "/meetings", icon: CalendarClock },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Team", href: "/team", icon: Users },
  { title: "Calls", href: "/calls", icon: Phone },
  { title: "Emails", href: "/emails", icon: Mail },
  { title: "Resources", href: "/resources", icon: BookOpen },
  { title: "Internal Chat", href: "/chat", icon: MessagesSquare },
];

export const secondaryNav: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];
