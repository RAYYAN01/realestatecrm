"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  monthlyLeadsTrend,
  revenueForecastTrend,
  leadSourceCounts,
  agentPerformance,
  propertyCategoryCounts,
  leadStatusCounts,
  pipelineFunnelData,
  conversionRate,
} from "@/lib/mock-data";

const gridColor = "var(--border)";
const axisColor = "var(--muted-foreground)";
const tickStyle = { fill: axisColor, fontSize: 12 };

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { name: string; value: number | string; color?: string }[];
  label?: string;
  formatter?: (value: number | string, name: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {entry.color && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
            )}
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonthlyLeadsChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={monthlyLeadsTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={tickStyle} axisLine={{ stroke: gridColor }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={36} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="leads"
          name="New leads"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#leadsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueForecastChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={revenueForecastTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--success)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={tickStyle} axisLine={{ stroke: gridColor }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}M`} />
        <Tooltip content={<ChartTooltip formatter={(v) => `₹${v}M`} />} />
        <Area
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke="var(--success)"
          strokeWidth={2}
          fill="url(#revenueFill)"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast"
          stroke="var(--success)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LeadSourcesChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={leadSourceCounts}
        layout="vertical"
        margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
        barCategoryGap={10}
      >
        <CartesianGrid stroke={gridColor} horizontal={false} />
        <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="count" name="Leads" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AgentPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={agentPerformance}
        layout="vertical"
        margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
        barCategoryGap={10}
      >
        <CartesianGrid stroke={gridColor} horizontal={false} />
        <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="deals" name="Leads handled" fill="var(--chart-2)" radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const categoryColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function PropertyCategoriesChart() {
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={200}>
        <PieChart>
          <Pie
            data={propertyCategoryCounts}
            dataKey="count"
            nameKey="name"
            innerRadius={48}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={2}
            stroke="var(--card)"
          >
            {propertyCategoryCounts.map((_, i) => (
              <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-1 flex-col gap-1.5">
        {propertyCategoryCounts.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: categoryColors[i % categoryColors.length] }}
            />
            <span className="flex-1 truncate text-muted-foreground">{entry.name}</span>
            <span className="font-medium text-foreground">{entry.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const stageOpacity: Record<string, number> = {
  New: 0.32,
  Contacted: 0.48,
  Interested: 0.62,
  Qualified: 0.78,
  Negotiation: 0.92,
  Won: 1,
};

export function LeadStatusDonut() {
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={200}>
        <PieChart>
          <Pie
            data={leadStatusCounts}
            dataKey="count"
            nameKey="status"
            innerRadius={48}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={2}
            stroke="var(--card)"
          >
            {leadStatusCounts.map((entry) => (
              <Cell
                key={entry.status}
                fill={
                  entry.status === "Lost"
                    ? "var(--destructive)"
                    : "var(--chart-1)"
                }
                fillOpacity={
                  entry.status === "Lost" ? 1 : stageOpacity[entry.status] ?? 1
                }
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-1 flex-col gap-1.5">
        {leadStatusCounts.map((entry) => (
          <div key={entry.status} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  entry.status === "Lost" ? "var(--destructive)" : "var(--chart-1)",
                opacity: entry.status === "Lost" ? 1 : stageOpacity[entry.status] ?? 1,
              }}
            />
            <span className="flex-1 truncate text-muted-foreground">{entry.status}</span>
            <span className="font-medium text-foreground">{entry.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PipelineFunnelChart() {
  const max = Math.max(...pipelineFunnelData.map((d) => d.count), 1);
  const stageColor: Record<string, number> = {
    New: 0.35,
    Contacted: 0.5,
    Interested: 0.65,
    Qualified: 0.8,
    Negotiation: 0.92,
    Won: 1,
  };
  return (
    <div className="flex flex-col gap-2.5">
      {pipelineFunnelData.map((d) => (
        <div key={d.stage} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs text-muted-foreground">{d.stage}</span>
          <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted">
            <div
              className="flex h-full items-center justify-end rounded-md px-2 text-xs font-medium text-primary-foreground transition-all"
              style={{
                width: `${Math.max((d.count / max) * 100, 8)}%`,
                backgroundColor: "var(--chart-1)",
                opacity: stageColor[d.stage] ?? 1,
              }}
            >
              {d.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversionMeter() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {conversionRate}%
        </span>
        <span className="text-xs text-muted-foreground">Won vs. Won+Lost</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-success/15">
        <div
          className="h-full rounded-full bg-success transition-all"
          style={{ width: `${conversionRate}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Industry benchmark for real estate is 32%.{" "}
        {conversionRate >= 32 ? "You're ahead of pace." : "Room to improve this quarter."}
      </p>
    </div>
  );
}
