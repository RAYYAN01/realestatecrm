import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div aria-hidden className="app-ambient pointer-events-none fixed inset-0 -z-10" />
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Topbar />
        <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
      </SidebarInset>
      <KeyboardShortcuts />
    </SidebarProvider>
  );
}
