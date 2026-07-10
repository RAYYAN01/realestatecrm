"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  CalendarPlus,
  Pencil,
  ChevronDown,
  Home,
  MapPin,
  Wallet,
  User,
  CalendarClock,
  Building2,
  BedDouble,
  Bath,
  Ruler,
  Compass,
  Car,
  CheckCircle2,
  FileText,
  Upload,
  Download,
  Trash2,
  Pin,
  PinOff,
  Star,
  Trophy,
  XCircle,
  ListPlus,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  MapPin as MapPinIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { AiSummaryCard } from "@/components/leads/ai-summary-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatCurrencyPKR,
  type Lead,
  type LeadStatus,
  type LostReason,
} from "@/lib/mock-data";
import { useLead, leadsStore } from "@/lib/store/leads-store";
import { useLeadActivities, activitiesStore } from "@/lib/store/activities-store";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { MeetingFormDialog } from "@/components/meetings/meeting-form-dialog";
import { CallFormDialog } from "@/components/calls/call-form-dialog";
import { cn } from "@/lib/utils";

const statusStages: LeadStatus[] = [
  "New", "Contacted", "Interested", "Qualified", "Negotiation", "Won",
];
const lostReasons: LostReason[] = [
  "Price Issue", "No Response", "Competitor", "Budget", "Cancelled", "Other",
];

function leadScore(lead: Lead) {
  let score = 30;
  const stageIdx = statusStages.indexOf(lead.status);
  if (stageIdx >= 0) score += stageIdx * 10;
  if (lead.status === "Won") score = 100;
  if (lead.status === "Lost") score = Math.min(score, 20);
  if (lead.priority === "High") score += 12;
  else if (lead.priority === "Medium") score += 6;
  return Math.min(100, score);
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lead, timeline, notes, documents } = useLead(params.id);
  const { tasks, meetings, calls } = useLeadActivities(params.id);
  const [editOpen, setEditOpen] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [taskOpen, setTaskOpen] = React.useState(false);
  const [meetingOpen, setMeetingOpen] = React.useState(false);
  const [callOpen, setCallOpen] = React.useState(false);

  if (!lead) {
    return (
      <EmptyState
        icon={User}
        title="Lead not found"
        description="This lead may have been deleted or the link is invalid."
        action={<Button size="sm" render={<Link href="/leads" />}>Back to Leads</Button>}
        className="my-16"
      />
    );
  }

  const score = leadScore(lead);
  const scoreTone = score >= 70 ? "text-success" : score >= 40 ? "text-warning-foreground dark:text-warning" : "text-muted-foreground";

  function changeStatus(status: LeadStatus, reason?: LostReason) {
    if (!lead) return;
    if (status === "Won") {
      leadsStore.changeStatus(lead.id, "Won", {
        wonDetails: {
          revenue: lead.budgetMax,
          closingDate: new Date().toISOString(),
          propertyPurchased: `${lead.propertyType} — ${lead.location}`,
          commission: Math.round(lead.budgetMax * 0.02),
        },
      });
      toast.success("Deal won! 🎉", { description: `${lead.name} moved to Won.` });
    } else if (status === "Lost") {
      leadsStore.changeStatus(lead.id, "Lost", { lostReason: reason ?? "Other" });
      toast.success("Lead marked as Lost", { description: `Reason: ${reason ?? "Other"}.` });
    } else {
      leadsStore.changeStatus(lead.id, status);
      toast.success(`Moved to ${status}`);
    }
  }

  function handleEditSubmit(values: {
    name: string; phone: string; email: string; location: string;
    budgetMin: string; budgetMax: string; propertyType: string;
    purpose: string; source: string; agent: string; priority: string; status: string;
  }) {
    if (!lead) return;
    leadsStore.updateLead(lead.id, {
      name: values.name,
      phone: values.phone,
      email: values.email,
      location: values.location,
      budgetMin: Number(values.budgetMin) || lead.budgetMin,
      budgetMax: Number(values.budgetMax) || lead.budgetMax,
      propertyType: values.propertyType,
      purpose: values.purpose as Lead["purpose"],
      source: values.source,
      agent: values.agent,
      priority: values.priority as Lead["priority"],
      status: values.status as LeadStatus,
    });
    toast.success("Lead updated");
  }

  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={lead.name}
        description={`${lead.id} · ${lead.propertyType} in ${lead.location}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Leads", href: "/leads" },
          { label: lead.name },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/leads")}>
              <ArrowLeft />
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="sm">
                    Change Stage
                    <ChevronDown />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Move to stage</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statusStages.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    disabled={s === lead.status}
                    onClick={() => changeStatus(s)}
                  >
                    {s === "Won" ? <Trophy /> : <CheckCircle2 />}
                    {s}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <XCircle />
                    Mark as Lost
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {lostReasons.map((r) => (
                      <DropdownMenuItem key={r} onClick={() => changeStatus("Lost", r)}>
                        {r}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        {/* Summary column */}
        <div className="flex flex-col gap-4">
          <Card className="gap-4 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback>
                  {lead.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{lead.name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StatusBadge status={lead.status} />
                  <PriorityBadge priority={lead.priority} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => leadsStore.logInteraction(lead.id, "call", "Call logged", `Outbound call to ${lead.name}.`)}>
                <Phone />
                Call
              </Button>
              <Button variant="outline" size="sm" onClick={() => leadsStore.logInteraction(lead.id, "email", "Email sent", `Email sent to ${lead.email}.`)}>
                <Mail />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={() => leadsStore.logInteraction(lead.id, "whatsapp", "WhatsApp sent", `WhatsApp message to ${lead.name}.`)}>
                <MessageCircle />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={() => leadsStore.logInteraction(lead.id, "meeting", "Meeting scheduled", `Meeting scheduled with ${lead.name}.`)}>
                <CalendarPlus />
                Meet
              </Button>
            </div>

            <Separator />

            <div className="flex flex-col gap-3.5">
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
              <InfoRow icon={Mail} label="Email" value={<span className="break-all">{lead.email}</span>} />
              <InfoRow icon={MapPin} label="Preferred Location" value={lead.location} />
              <InfoRow icon={Wallet} label="Budget" value={`${formatCurrencyPKR(lead.budgetMin)} – ${formatCurrencyPKR(lead.budgetMax)}`} />
              <InfoRow icon={User} label="Assigned Agent" value={lead.agent} />
              <InfoRow icon={Building2} label="Lead Source" value={lead.source} />
              <InfoRow icon={CalendarClock} label="Created" value={format(new Date(lead.createdAt), "dd MMM yyyy")} />
            </div>
          </Card>

          <Card className="gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Lead Score</span>
              <span className={cn("text-lg font-semibold", scoreTone)}>{score}</span>
            </div>
            <Progress value={score} />
            <p className="text-xs text-muted-foreground">
              {score >= 70 ? "Hot lead — prioritise follow-up." : score >= 40 ? "Warm lead — keep nurturing." : "Cold lead — low engagement."}
            </p>
          </Card>
        </div>

        {/* Tabs column */}
        <Tabs defaultValue="overview" className="gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="activities">
              Activities
              {tasks.length + meetings.length + calls.length > 0 && (
                <span className="ml-1 rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">
                  {tasks.length + meetings.length + calls.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="flex flex-col gap-4">
            <AiSummaryCard lead={lead} timeline={timeline} />
            {lead.status === "Won" && lead.wonDetails && (
              <Card className="gap-3 border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-success" />
                  <span className="text-sm font-semibold text-foreground">Deal Won</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div><p className="text-xs text-muted-foreground">Revenue</p><p className="text-sm font-medium text-foreground">{formatCurrencyPKR(lead.wonDetails.revenue)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Commission</p><p className="text-sm font-medium text-foreground">{formatCurrencyPKR(lead.wonDetails.commission)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Closed</p><p className="text-sm font-medium text-foreground">{format(new Date(lead.wonDetails.closingDate), "dd MMM yyyy")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Property</p><p className="text-sm font-medium text-foreground">{lead.wonDetails.propertyPurchased}</p></div>
                </div>
              </Card>
            )}
            {lead.status === "Lost" && (
              <Card className="gap-2 border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="size-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground">Lead Lost</span>
                </div>
                <p className="text-sm text-muted-foreground">Reason: <span className="font-medium text-foreground">{lead.lostReason ?? "Other"}</span></p>
                <div>
                  <Button variant="outline" size="sm" onClick={() => changeStatus("Contacted")}>
                    Reactivate lead
                  </Button>
                </div>
              </Card>
            )}
            <Card className="gap-0 p-0">
              <div className="border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Basic Details</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                <InfoRow icon={Home} label="Property Type" value={lead.propertyType} />
                <InfoRow icon={CheckCircle2} label="Purpose" value={lead.purpose} />
                <InfoRow icon={MapPin} label="Preferred Location" value={lead.location} />
                <InfoRow icon={Wallet} label="Budget Range" value={`${formatCurrencyPKR(lead.budgetMin)} – ${formatCurrencyPKR(lead.budgetMax)}`} />
                <InfoRow icon={CalendarClock} label="Last Contact" value={format(new Date(lead.lastContact), "dd MMM yyyy")} />
                <InfoRow icon={User} label="Assigned Agent" value={lead.agent} />
              </div>
            </Card>
          </TabsContent>

          {/* Property preferences */}
          <TabsContent value="property">
            <Card className="gap-0 p-0">
              <div className="border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Property Preferences</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoRow icon={BedDouble} label="Bedrooms" value={lead.bedrooms} />
                <InfoRow icon={Bath} label="Bathrooms" value={lead.bathrooms} />
                <InfoRow icon={Ruler} label="Area Required" value={lead.areaRequired} />
                <InfoRow icon={Compass} label="Facing" value={lead.facing} />
                <InfoRow icon={Car} label="Parking" value={`${lead.parking} space${lead.parking === 1 ? "" : "s"}`} />
                <InfoRow icon={CheckCircle2} label="Possession" value={lead.possession} />
              </div>
              <Separator />
              <div className="p-4">
                <p className="mb-2 text-xs text-muted-foreground">Amenities</p>
                {lead.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {lead.amenities.map((a) => (
                      <Badge key={a} variant="secondary">{a}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No amenities specified.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Activities — linked tasks / meetings / calls */}
          <TabsContent value="activities" className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setTaskOpen(true)}>
                <ListPlus />
                Add Task
              </Button>
              <Button size="sm" variant="outline" onClick={() => setMeetingOpen(true)}>
                <CalendarPlus />
                Schedule Meeting
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCallOpen(true)}>
                <PhoneCall />
                Log Call
              </Button>
            </div>

            {/* Tasks */}
            <Card className="gap-0 p-0">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
                <Badge variant="secondary">{tasks.length}</Badge>
              </div>
              {tasks.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No tasks linked to this lead yet.</p>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 p-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.assignedTo} · due {format(new Date(t.dueDate), "dd MMM")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={t.priority} />
                        <Badge
                          variant="ghost"
                          className={cn(
                            "border-0 font-medium",
                            t.status === "Done" && "bg-success/10 text-success",
                            t.status === "In Progress" && "bg-info/10 text-info",
                            t.status === "To Do" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Meetings */}
            <Card className="gap-0 p-0">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Meetings</h3>
                <Badge variant="secondary">{meetings.length}</Badge>
              </div>
              {meetings.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No meetings scheduled with this lead yet.</p>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {meetings.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 p-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{m.title}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPinIcon className="size-3" />
                          {m.location} · {format(new Date(m.date), "dd MMM")} · {m.time}
                        </p>
                      </div>
                      <Badge
                        variant="ghost"
                        className={cn(
                          "border-0 font-medium",
                          m.status === "Completed" && "bg-success/10 text-success",
                          m.status === "Scheduled" && "bg-info/10 text-info",
                          m.status === "Cancelled" && "bg-destructive/10 text-destructive"
                        )}
                      >
                        {m.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Calls */}
            <Card className="gap-0 p-0">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Calls</h3>
                <Badge variant="secondary">{calls.length}</Badge>
              </div>
              {calls.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No calls logged with this lead yet.</p>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {calls.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 p-3.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {c.direction === "Incoming" ? (
                          <PhoneIncoming className="size-4 shrink-0 text-success" />
                        ) : (
                          <PhoneOutgoing className="size-4 shrink-0 text-info" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{c.summary}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.agent} · {c.duration} · {format(new Date(c.timestamp), "dd MMM, hh:mm a")}
                          </p>
                        </div>
                      </div>
                      {c.followUp && (
                        <Badge variant="ghost" className="border-0 bg-warning/15 font-medium text-warning-foreground dark:text-warning">
                          Follow-up
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <Card className="gap-0 p-0">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Documents</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    leadsStore.addDocument(lead.id, {
                      id: `${lead.id}-doc-${Date.now()}`,
                      name: `Document-${documents.length + 1}.pdf`,
                      type: "PDF",
                      size: "1.0 MB",
                      uploadedAt: new Date().toISOString(),
                    })
                  }
                >
                  <Upload />
                  Upload
                </Button>
              </div>
              {documents.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents yet"
                  description="Upload CNIC, agreements, property papers and other files here."
                  className="border-none"
                />
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3.5">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} · {doc.size} · {format(new Date(doc.uploadedAt), "dd MMM yyyy")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => toast.success(`Downloading ${doc.name}`)}>
                        <Download className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline">
            <Card className="gap-0 p-0">
              <div className="border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Activity Timeline</h3>
              </div>
              <div className="p-4">
                {timeline.length === 0 ? (
                  <EmptyState icon={CalendarClock} title="No activity yet" className="border-none" />
                ) : (
                  <LeadTimeline events={timeline} />
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="flex flex-col gap-4">
            <Card className="gap-3 p-4">
              <Textarea
                placeholder="Write a note… mention teammates with @"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className="min-h-20"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!noteDraft.trim()}
                  onClick={() => {
                    leadsStore.addNote(lead.id, noteDraft.trim());
                    setNoteDraft("");
                    toast.success("Note added");
                  }}
                >
                  Add Note
                </Button>
              </div>
            </Card>

            {notes.length === 0 ? (
              <EmptyState icon={Star} title="No notes yet" description="Add your first note above." />
            ) : (
              <div className="flex flex-col gap-3">
                {[...pinnedNotes, ...otherNotes].map((note) => (
                  <Card key={note.id} className={cn("gap-2 p-4", note.pinned && "border-warning/40 bg-warning/5")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {note.author.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">{note.author}</span>
                        {note.pinned && <Badge variant="ghost" className="border-0 bg-warning/15 text-warning-foreground dark:text-warning">Pinned</Badge>}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon-xs" onClick={() => leadsStore.togglePinNote(lead.id, note.id)}>
                          {note.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-destructive" onClick={() => leadsStore.deleteNote(lead.id, note.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90">{note.content}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(note.timestamp), "dd MMM yyyy, hh:mm a")}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <LeadFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        lead={lead}
        onSubmit={handleEditSubmit}
      />

      <TaskFormDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        defaultLeadId={lead.id}
        defaultLeadName={lead.name}
        lockLead
        onSubmit={(values) => {
          activitiesStore.addTask(values);
          leadsStore.logInteraction(lead.id, "note", "Task created", values.title);
          toast.success("Task created", { description: values.title });
        }}
      />

      <MeetingFormDialog
        open={meetingOpen}
        onOpenChange={setMeetingOpen}
        defaultLeadId={lead.id}
        defaultLeadName={lead.name}
        lockLead
        onSubmit={(values) => {
          activitiesStore.addMeeting(values);
          leadsStore.logInteraction(lead.id, "meeting", "Meeting scheduled", `${values.title} · ${values.time}`);
          toast.success("Meeting scheduled", { description: values.title });
        }}
      />

      <CallFormDialog
        open={callOpen}
        onOpenChange={setCallOpen}
        defaultLeadId={lead.id}
        defaultLeadName={lead.name}
        lockLead
        onSubmit={(values) => {
          activitiesStore.addCall(values);
          leadsStore.logInteraction(lead.id, "call", `${values.direction} call logged`, values.summary);
          toast.success("Call logged");
        }}
      />
    </div>
  );
}
