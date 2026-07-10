"use client";

import * as React from "react";
import { toast } from "sonner";
import { UserPlus, Search, Users, Mail, MoreHorizontal, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";

type Role = "Admin" | "Manager" | "Agent";
type Member = { id: string; name: string; email: string; role: Role; status: "Active" | "Invited" };

const roleStyles: Record<Role, string> = {
  Admin: "bg-primary/10 text-primary",
  Manager: "bg-info/10 text-info",
  Agent: "bg-muted text-muted-foreground",
};

export default function TeamPage() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [search, setSearch] = React.useState("");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("Agent");

  const filtered = members.filter(
    (m) =>
      !search.trim() ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  function invite() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setMembers((prev) => [
      { id: `TM-${Date.now()}`, name: name.trim(), email: email.trim(), role, status: "Invited" },
      ...prev,
    ]);
    toast.success(`Invitation sent to ${name.trim()}`);
    setInviteOpen(false);
    setName(""); setEmail(""); setRole("Agent");
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Team"
        description="Manage your consultants, their roles and access."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Team" }]}
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus />
            Invite Member
          </Button>
        }
      />

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search team…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border/70 glass">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={members.length === 0 ? "No team members yet" : "No members match your search"}
            description={members.length === 0 ? "Invite consultants to collaborate on leads, tasks and deals." : "Try a different search."}
            action={members.length === 0 ? (
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus />
                Invite Member
              </Button>
            ) : undefined}
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
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="size-3" />
                          {m.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="ghost" className={cn("border-0 font-medium", roleStyles[m.role])}>
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="ghost" className={cn("border-0 font-medium", m.status === "Active" ? "bg-success/10 text-success" : "bg-warning/15 text-warning-foreground dark:text-warning")}>
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>} />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem variant="destructive" onClick={() => { setMembers((prev) => prev.filter((x) => x.id !== m.id)); toast.success("Member removed"); }}>
                          <Trash2 />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>They&apos;ll receive an email invitation to join your workspace.</DialogDescription>
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
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => v && setRole(v as Role)} items={{ Admin: "Admin", Manager: "Manager", Agent: "Agent" }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={invite}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
