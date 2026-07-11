import Link from "next/link";
import {
  Users,
  UserPlus,
  PhoneCall,
  ThumbsUp,
  CheckCircle2,
  Handshake,
  Trophy,
  XCircle,
  Building2,
  Wallet,
  Percent,
  CalendarClock,
  ListChecks,
  Plus,
  ArrowRight,
  PhoneOutgoing,
  Sparkles,
  Home,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  leads,
  clients,
  tasks,
  recentActivity,
  upcomingSchedule,
  formatCurrencyPKR,
} from "@/lib/mock-data";
import {
  MonthlyLeadsChart,
  RevenueForecastChart,
  LeadSourcesChart,
  AgentPerformanceChart,
  PropertyCategoriesChart,
  LeadStatusDonut,
  PipelineFunnelChart,
  ConversionMeter,
} from "@/components/dashboard/charts";
import { getServerRole } from "@/lib/auth/server";

function countStatus(status: string) {
  return leads.filter((l) => l.status === status).length;
}

const activityIcon: Record<string, React.ElementType> = {
  lead_added: UserPlus,
  meeting_scheduled: CalendarClock,
  lead_qualified: CheckCircle2,
  property_shared: Home,
  deal_won: Trophy,
  deal_lost: XCircle,
};

const scheduleIcon: Record<string, React.ElementType> = {
  Meeting: CalendarClock,
  Call: PhoneOutgoing,
  Task: ListChecks,
};

export default async function DashboardPage() {
  const { isAdmin } = await getServerRole();
  const revenuePotential = leads
    .filter((l) => l.status !== "Lost")
    .reduce((sum, l) => sum + l.budgetMax, 0);
  const conversionRate = Math.round(
    (countStatus("Won") / Math.max(countStatus("Won") + countStatus("Lost"), 1)) * 100
  );
  const pendingTasks = tasks.filter((t) => t.status !== "Done").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Your team's pipeline, performance and schedule at a glance."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Sparkles />
              AI Summary
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/leads" />}>
              <Plus />
              New Lead
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Total Leads" value={String(leads.length)} icon={Users} tone="primary" trend={{ value: "8.2%", direction: "up" }} />
        <StatCard label="New Leads" value={String(countStatus("New"))} icon={UserPlus} trend={{ value: "3.1%", direction: "up" }} />
        <StatCard label="Contacted" value={String(countStatus("Contacted"))} icon={PhoneCall} />
        <StatCard label="Interested" value={String(countStatus("Interested"))} icon={ThumbsUp} />
        <StatCard label="Qualified" value={String(countStatus("Qualified"))} icon={CheckCircle2} tone="warning" />
        <StatCard label="Negotiation" value={String(countStatus("Negotiation"))} icon={Handshake} tone="warning" />
        <StatCard label="Won" value={String(countStatus("Won"))} icon={Trophy} tone="success" trend={{ value: "12%", direction: "up" }} />
        <StatCard label="Lost" value={String(countStatus("Lost"))} icon={XCircle} tone="destructive" trend={{ value: "2%", direction: "down", positive: false }} />
        <StatCard label="Active Clients" value={String(clients.length)} icon={Building2} tone="primary" />
        {isAdmin && (
          <StatCard label="Revenue Potential" value={formatCurrencyPKR(revenuePotential)} icon={Wallet} tone="success" />
        )}
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={Percent} />
        <StatCard label="Pending Tasks" value={String(pendingTasks)} icon={ListChecks} tone="warning" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Leads</CardTitle>
            <CardDescription>New leads captured per month, year to date.</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyLeadsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Where new leads originate from.</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadSourcesChart />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
            <CardDescription>Leads at each stage of the sales pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineFunnelChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lead Status</CardTitle>
            <CardDescription>Distribution across all lead statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadStatusDonut />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Won leads as a share of closed leads.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversionMeter />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {isAdmin && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>Actual vs. projected revenue, in ₹ millions.</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueForecastChart />
            </CardContent>
          </Card>
        )}
        <Card className={isAdmin ? undefined : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle>Property Categories</CardTitle>
            <CardDescription>Lead demand by property type.</CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyCategoriesChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>Leads handled per agent this quarter.</CardDescription>
          </CardHeader>
          <CardContent>
            <AgentPerformanceChart />
          </CardContent>
        </Card>

        {/* Upcoming schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Meetings, calls and tasks today.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {upcomingSchedule.map((item) => {
              const Icon = scheduleIcon[item.kind];
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-muted/60">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.with ? `${item.with} · ` : ""}
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Activity + Recent Leads */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex flex-col gap-4 pl-1">
              {recentActivity.map((activity, i) => {
                const Icon = activityIcon[activity.type];
                return (
                  <div key={activity.id} className="relative flex gap-3">
                    {i < recentActivity.length - 1 && (
                      <span className="absolute top-7 left-[15px] h-[calc(100%-4px)] w-px bg-border" />
                    )}
                    <div className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted ring-4 ring-card">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1 pb-0.5">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{activity.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest leads added to your pipeline.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/leads" />}>
              View all
              <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4">Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.slice(0, 6).map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="pl-4">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {lead.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.location}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrencyPKR(lead.budgetMin)}–{formatCurrencyPKR(lead.budgetMax)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {lead.agent.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{lead.agent}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
