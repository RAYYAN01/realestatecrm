"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  UserPlus,
  Search,
  Users,
  Mail,
  MoreHorizontal,
  Trash2,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

type Member = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "employee";
  status: "invited" | "active" | "disabled";
};

const roleStyles: Record<Member["role"], string> = {
  admin: "bg-primary/10 text-primary",
  employee: "bg-muted text-muted-foreground",
};

const statusStyles: Record<Member["status"], string> = {
  active: "bg-success/10 text-success",
  invited: "bg-warning/15 text-warning-foreground dark:text-warning",
  disabled: "bg-muted text-muted-foreground",
};

function initials(name: string, email: string) {
  const base = name?.trim() || email;
  return base
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamPage() {
  const { email: authEmail, isAdmin, loading: authLoading } = useAuth();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Pure fetch (no setState) so it's safe to call from an effect's async body.
  const fetchMembers = React.useCallback(async (): Promise<Member[]> => {
    if (!isSupabaseConfigured) return [];
    const supabase = createClient();
    const { data, error } = await supabase
      .from("app_members")
      .select("id,email,full_name,role,status")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Couldn't load the team");
      return [];
    }
    return (data ?? []) as Member[];
  }, []);

  const refresh = React.useCallback(async () => {
    setMembers(await fetchMembers());
  }, [fetchMembers]);

  React.useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      const rows = await fetchMembers();
      if (!cancelled) {
        setMembers(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, fetchMembers]);

  const filtered = members.filter(
    (m) =>
      !search.trim() ||
      (m.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  async function invite() {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim() || !trimmedEmail) {
      toast.error("Name and email are required");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("app_members").insert({
      email: trimmedEmail,
      full_name: name.trim(),
      role: "employee",
      status: "invited",
      invited_by: authEmail,
    });
    setSaving(false);
    if (error) {
      toast.error(
        error.code === "23505"
          ? "That email is already on the team"
          : "Couldn't send the invite"
      );
      return;
    }
    toast.success(`${name.trim()} invited`, {
      description: "They can now sign up with this email.",
    });
    setInviteOpen(false);
    setName("");
    setEmail("");
    refresh();
  }

  async function remove(m: Member) {
    const supabase = createClient();
    const { error } = await supabase.from("app_members").delete().eq("id", m.id);
    if (error) {
      toast.error("Couldn't remove member");
      return;
    }
    setMembers((prev) => prev.filter((x) => x.id !== m.id));
    toast.success("Member removed");
  }

  // Non-admins can't manage the team — RLS only returns their own row anyway.
  if (!authLoading && !isAdmin) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Team"
          description="Your workspace teammates."
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Team" }]}
        />
        <div className="rounded-xl border border-border/70 glass p-10">
          <EmptyState
            icon={Lock}
            title="Admins manage the team"
            description="Only administrators can invite or remove members. Contact your admin if you need access changed."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Team"
        description="Invite consultants and control who can access the CRM."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Team" }]}
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus />
            Invite Member
          </Button>
        }
      />

      <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-foreground" />
        Only invited emails can sign up. Admins are set at deploy time — invites here create <span className="font-medium text-foreground">employee</span> access.
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search team…"
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border/70 glass">
        {loading || authLoading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={members.length === 0 ? "No team members yet" : "No members match your search"}
            description={
              members.length === 0
                ? "Invite consultants to collaborate on leads, tasks and deals."
                : "Try a different search."
            }
            action={
              members.length === 0 ? (
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <UserPlus />
                  Invite Member
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const isSelf = m.email.toLowerCase() === (authEmail ?? "").toLowerCase();
                return (
                  <TableRow key={m.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {initials(m.full_name ?? "", m.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {m.full_name || m.email.split("@")[0]}
                            {isSelf && (
                              <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                            )}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="size-3" />
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="ghost" className={cn("border-0 font-medium capitalize", roleStyles[m.role])}>
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="ghost" className={cn("border-0 font-medium capitalize", statusStyles[m.status])}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={m.role === "admin" || isSelf}
                            onClick={() => remove(m)}
                          >
                            <Trash2 />
                            {m.role === "admin" ? "Can't remove admin" : "Remove"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              They&apos;ll be able to sign up on the login page using this email.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tm-name">Full Name</Label>
              <Input id="tm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ravi Kumar" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tm-email">Email</Label>
              <Input id="tm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={invite} disabled={saving}>
              {saving ? "Inviting…" : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
