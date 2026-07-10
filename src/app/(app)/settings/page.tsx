"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  User,
  Building,
  Bell,
  ShieldCheck,
  Users2,
  Palette,
  Plug,
  KeyRound,
  Sun,
  Moon,
  Monitor,
  Copy,
  Trash2,
  Plus,
  Check,
  ScrollText,
} from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuditLog, auditStore } from "@/lib/store/audit-store";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const tabs = [
  { value: "profile", label: "Profile", icon: User },
  { value: "company", label: "Company", icon: Building },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "roles", label: "Roles & Permissions", icon: Users2 },
  { value: "security", label: "Security", icon: ShieldCheck },
  { value: "appearance", label: "Appearance", icon: Palette },
  { value: "integrations", label: "Integrations", icon: Plug },
  { value: "audit", label: "Activity Log", icon: ScrollText },
  { value: "api", label: "API & Backup", icon: KeyRound },
];

const auditCategoryStyles: Record<string, string> = {
  lead: "bg-primary/10 text-primary",
  task: "bg-chart-2/10 text-chart-2",
  meeting: "bg-chart-5/10 text-chart-5",
  call: "bg-info/10 text-info",
  prospect: "bg-warning/15 text-warning-foreground dark:text-warning",
  auth: "bg-muted text-muted-foreground",
  settings: "bg-muted text-muted-foreground",
};

const team = [
  { name: "Sara Ahmed", email: "sara.ahmed@estatia.com", role: "Admin" },
  { name: "Omar Khalid", email: "omar.khalid@estatia.com", role: "Manager" },
  { name: "Fatima Noor", email: "fatima.noor@estatia.com", role: "Agent" },
  { name: "Ali Raza", email: "ali.raza@estatia.com", role: "Agent" },
  { name: "Hina Malik", email: "hina.malik@estatia.com", role: "Agent" },
];

const integrations = [
  { name: "Google Calendar", description: "Sync meetings and reminders", connected: true },
  { name: "WhatsApp Business", description: "Send messages directly to leads", connected: true },
  { name: "Zameen.com", description: "Import leads from listings", connected: false },
  { name: "Slack", description: "Get notified on deal updates", connected: false },
];

function SettingsSection({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-col gap-1 border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-col gap-4 p-4">{children}</div>
      {footer && <div className="flex justify-end border-t border-border bg-muted/40 p-4">{footer}</div>}
    </Card>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const auditLog = useAuditLog();
  const [notifPrefs, setNotifPrefs] = React.useState({
    email: true,
    sms: false,
    push: true,
    digest: true,
    dealAlerts: true,
  });
  const [twoFactor, setTwoFactor] = React.useState(false);
  const [apiKeys, setApiKeys] = React.useState([
    { id: "key-1", label: "Production", value: "sk_live_9f2a...c81b", createdAt: "12 Mar 2026" },
  ]);
  const [integrationState, setIntegrationState] = React.useState(integrations);

  function copyKey(value: string) {
    navigator.clipboard?.writeText(value);
    toast.success("API key copied to clipboard");
  }

  function generateKey() {
    const id = `key-${apiKeys.length + 1}`;
    setApiKeys((prev) => [
      ...prev,
      { id, label: `Secret key ${prev.length + 1}`, value: `sk_live_${Math.random().toString(36).slice(2, 12)}`, createdAt: "Today" },
    ]);
    toast.success("New API key generated");
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Settings"
        description="Manage your profile, company, security and integrations."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <Tabs defaultValue="profile" orientation="vertical" className="lg:flex-row">
        <TabsList variant="line" className="h-fit flex-col items-stretch gap-0.5 lg:w-56">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="justify-start gap-2 px-2.5 py-1.5">
              <t.icon className="size-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1">
          <TabsContent value="profile" className="mt-0">
            <SettingsSection
              title="Profile"
              description="Your personal information and how it appears across the CRM."
              footer={<Button size="sm" onClick={() => toast.success("Profile updated")}>Save Changes</Button>}
            >
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarFallback className="text-lg">SA</AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.info("Upload a new photo")}>Change photo</Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">Remove</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input id="profile-name" defaultValue="Sara Ahmed" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-role">Job Title</Label>
                  <Input id="profile-role" defaultValue="Sales Director" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" type="email" defaultValue="sara.ahmed@estatia.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input id="profile-phone" defaultValue="+91 90000 12345" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea id="profile-bio" placeholder="A short bio about yourself" className="min-h-20" />
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="company" className="mt-0">
            <SettingsSection
              title="Company"
              description="Details shown on invoices, emails and client-facing documents."
              footer={<Button size="sm" onClick={() => toast.success("Company details updated")}>Save Changes</Button>}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="Naaz AI Labs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company-industry">Industry</Label>
                  <Input id="company-industry" defaultValue="Real Estate" />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Input id="company-address" defaultValue="Suite 4B, Gulberg III, Lahore, Pakistan" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input id="company-phone" defaultValue="+91 80 1234 5678" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company-website">Website</Label>
                  <Input id="company-website" defaultValue="www.estatiacrm.com" />
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <SettingsSection title="Notification Preferences" description="Choose how you'd like to be notified.">
              {[
                { key: "email" as const, label: "Email notifications", desc: "Lead updates, task reminders and daily summaries" },
                { key: "sms" as const, label: "SMS notifications", desc: "Time-sensitive alerts sent to your phone" },
                { key: "push" as const, label: "Push notifications", desc: "Real-time alerts on desktop and mobile" },
                { key: "digest" as const, label: "Weekly digest", desc: "A summary of your team's performance every Monday" },
                { key: "dealAlerts" as const, label: "Deal alerts", desc: "Get notified instantly when a deal is won or lost" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[item.key]}
                    onCheckedChange={(checked) => setNotifPrefs((prev) => ({ ...prev, [item.key]: checked }))}
                  />
                </div>
              ))}
            </SettingsSection>
          </TabsContent>

          <TabsContent value="roles" className="mt-0">
            <SettingsSection
              title="Roles & Permissions"
              description="Manage your team's access levels."
              footer={<Button size="sm" onClick={() => toast.info("Invite teammate form coming right up")}><Plus />Invite Teammate</Button>}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.map((member) => (
                    <TableRow key={member.email}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-[11px]">
                              {member.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{member.name}</span>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={member.role}>
                          <SelectTrigger size="sm" className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Agent">Agent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <div className="flex flex-col gap-4">
              <SettingsSection
                title="Password"
                description="Change your password regularly to keep your account secure."
                footer={<Button size="sm" onClick={() => toast.success("Password updated")}>Update Password</Button>}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground">
                      {twoFactor ? "2FA is currently enabled via authenticator app." : "Protect your account with an authenticator app."}
                    </p>
                  </div>
                  <Switch
                    checked={twoFactor}
                    onCheckedChange={(checked) => {
                      setTwoFactor(checked);
                      toast.success(checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
                    }}
                  />
                </div>
              </SettingsSection>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <div className="flex flex-col gap-4">
              <SettingsSection title="Theme" description="Choose how Naaz AI CRM looks on your device.">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                        theme === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/60"
                      )}
                    >
                      <opt.icon className="size-5 text-foreground" />
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                      {theme === opt.value && <Check className="size-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </SettingsSection>
              <SettingsSection title="Language & Region" description="Set your preferred language and date format.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Language</Label>
                    <Select defaultValue="en" items={{ en: "English", ur: "Urdu" }}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ur">Urdu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Date Format</Label>
                    <Select
                      defaultValue="dd-mm-yyyy"
                      items={{ "dd-mm-yyyy": "DD-MM-YYYY", "mm-dd-yyyy": "MM-DD-YYYY" }}
                    >
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                        <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SettingsSection>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-0">
            <SettingsSection title="Integrations" description="Connect Naaz AI CRM with the tools your team already uses.">
              {integrationState.map((integration, i) => (
                <div key={integration.name} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <Plug className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <Button
                    variant={integration.connected ? "outline" : "default"}
                    size="sm"
                    onClick={() => {
                      setIntegrationState((prev) =>
                        prev.map((it, idx) => (idx === i ? { ...it, connected: !it.connected } : it))
                      );
                      toast.success(integration.connected ? `Disconnected ${integration.name}` : `Connected ${integration.name}`);
                    }}
                  >
                    {integration.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))}
            </SettingsSection>
          </TabsContent>

          <TabsContent value="audit" className="mt-0">
            <SettingsSection
              title="Activity Log"
              description="An immutable audit trail of important actions across the CRM."
              footer={
                auditLog.length > 0 ? (
                  <Button variant="outline" size="sm" onClick={() => { auditStore.clear(); toast.success("Activity log cleared"); }}>
                    <Trash2 />
                    Clear log
                  </Button>
                ) : undefined
              }
            >
              {auditLog.length === 0 ? (
                <EmptyState
                  icon={ScrollText}
                  title="No activity yet"
                  description="Actions like creating, editing, merging or converting records will be recorded here."
                  className="border-none"
                />
              ) : (
                <div className="-m-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4">Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead className="pr-4">When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLog.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="pl-4 font-medium text-foreground">{entry.action}</TableCell>
                          <TableCell className="text-muted-foreground">{entry.target}</TableCell>
                          <TableCell>
                            <Badge variant="ghost" className={cn("border-0 font-medium capitalize", auditCategoryStyles[entry.category])}>
                              {entry.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{entry.actor}</TableCell>
                          <TableCell className="pr-4 text-muted-foreground">
                            {format(new Date(entry.timestamp), "dd MMM yyyy, hh:mm a")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </SettingsSection>
          </TabsContent>

          <TabsContent value="api" className="mt-0">
            <div className="flex flex-col gap-4">
              <SettingsSection
                title="API Keys"
                description="Use API keys to integrate Naaz AI CRM with external systems."
                footer={<Button size="sm" onClick={generateKey}><Plus />Generate New Key</Button>}
              >
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{key.label}</p>
                      <p className="font-mono text-xs text-muted-foreground">{key.value}</p>
                      <p className="text-[11px] text-muted-foreground">Created {key.createdAt}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => copyKey(key.value)}>
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setApiKeys((prev) => prev.filter((k) => k.id !== key.id));
                          toast.success("API key revoked");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </SettingsSection>

              <SettingsSection
                title="Backup"
                description="Download a full backup of your CRM data."
                footer={<Button size="sm" variant="outline" onClick={() => toast.success("Backup started, we'll email you when it's ready")}>Request Backup</Button>}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Automatic weekly backups</p>
                    <p className="text-xs text-muted-foreground">Last backup: 2 days ago</p>
                  </div>
                  <Badge variant="ghost" className="border-0 bg-success/10 font-medium text-success">Active</Badge>
                </div>
              </SettingsSection>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
