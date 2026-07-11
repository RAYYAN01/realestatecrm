export type LeadStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Qualified"
  | "Negotiation"
  | "Won"
  | "Lost";

export type Priority = "Low" | "Medium" | "High";

export type LostReason =
  | "Price Issue"
  | "No Response"
  | "Competitor"
  | "Budget"
  | "Cancelled"
  | "Other";

export type WonDetails = {
  revenue: number;
  closingDate: string;
  propertyPurchased: string;
  commission: number;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  propertyType: string;
  purpose: "Buy" | "Rent" | "Invest";
  source: string;
  agent: string;
  priority: Priority;
  status: LeadStatus;
  createdAt: string;
  lastContact: string;
  // Property preferences (Phase 3)
  bedrooms: number;
  bathrooms: number;
  areaRequired: string;
  possession: "Ready to Move" | "Under Construction";
  facing: string;
  parking: number;
  amenities: string[];
  // Outcome details (Phase 4)
  wonDetails?: WonDetails;
  lostReason?: LostReason;
  // Phase 6
  favorite?: boolean;
};

const agents = [
  "Ravi Kumar",
  "Priya Nair",
  "Arjun Reddy",
  "Sneha Iyer",
  "Karthik Menon",
  "Deepika Rao",
  "Rahul Sharma",
  "Ananya Pillai",
];

const locations = [
  "Whitefield, Bangalore",
  "Koramangala, Bangalore",
  "HSR Layout, Bangalore",
  "Electronic City, Bangalore",
  "Gachibowli, Hyderabad",
  "Kondapur, Hyderabad",
  "Banjara Hills, Hyderabad",
  "Kukatpally, Hyderabad",
  "Powai, Mumbai",
  "Bandra West, Mumbai",
  "Andheri East, Mumbai",
  "Baner, Pune",
  "Hinjewadi, Pune",
  "Wakad, Pune",
  "Gurgaon Sector 54, Delhi NCR",
  "Noida Sector 150, Delhi NCR",
  "Anna Nagar, Chennai",
  "OMR, Chennai",
];

const sources = [
  "Website",
  "Facebook Ads",
  "Google Ads",
  "Referral",
  "Walk-in",
  "99acres",
  "MagicBricks",
  "Housing.com",
  "Instagram",
  "Cold Call",
];

const propertyTypes = ["Apartment", "Villa", "Plot", "Penthouse", "Commercial", "Row House", "Studio"];

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
  "Krishna", "Ishaan", "Rohan", "Vikram", "Karthik", "Rahul", "Nikhil", "Aniket",
  "Ananya", "Diya", "Aadhya", "Saanvi", "Aarohi", "Anika", "Navya", "Kavya",
  "Priya", "Riya", "Neha", "Pooja", "Sneha", "Deepika", "Meera", "Divya",
];
const lastNames = [
  "Kumar", "Sharma", "Reddy", "Rao", "Patel", "Nair", "Iyer", "Gupta",
  "Singh", "Mehta", "Shah", "Verma", "Menon", "Pillai", "Desai", "Joshi",
  "Naidu", "Chowdary", "Bose", "Kapoor",
];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// Fixed anchor so mock data is deterministic across server and client renders
// (using the real current time here would cause hydration mismatches whenever
// a formatted timestamp straddles a minute boundary between SSR and hydration).
const NOW = new Date("2026-07-07T15:00:00.000Z").getTime();

function randomDate(daysAgoMax: number) {
  const days = Math.floor(rand() * daysAgoMax);
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const statuses: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Qualified",
  "Negotiation",
  "Won",
  "Lost",
];
const priorities: Priority[] = ["Low", "Medium", "High"];

const amenitiesPool = [
  "Clubhouse", "Swimming Pool", "Gym", "24/7 Security",
  "Power Backup", "Covered Parking", "Kids Play Area", "Landscaped Garden",
  "Jogging Track", "Indoor Games", "Rooftop Lounge", "EV Charging",
];
const facings = ["North", "South", "East", "West", "North-East", "South-West"];
const lostReasons: LostReason[] = [
  "Price Issue", "No Response", "Competitor", "Budget", "Cancelled", "Other",
];

export const leads: Lead[] = Array.from({ length: 100 }).map((_, i) => {
  const name = `${pick(firstNames)} ${pick(lastNames)}`;
  const budgetMin = (Math.floor(rand() * 45) + 5) * 1_000_000;
  const budgetMax = budgetMin + (Math.floor(rand() * 25) + 5) * 1_000_000;
  const createdAt = randomDate(120);
  const propertyType = pick(propertyTypes);
  const location = pick(locations);
  const agent = pick(agents);
  const status = pick(statuses);
  const amenityCount = 2 + Math.floor(rand() * 4);
  const amenities = Array.from(
    new Set(Array.from({ length: amenityCount }).map(() => pick(amenitiesPool)))
  );

  const lead: Lead = {
    id: `LD-${String(1000 + i)}`,
    name,
    phone: `+91 9${Math.floor(rand() * 9)}${Math.floor(
      1000000 + rand() * 8999999
    )}`,
    email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
    location,
    budgetMin,
    budgetMax,
    propertyType,
    purpose: pick(["Buy", "Rent", "Invest"] as const),
    source: pick(sources),
    agent,
    priority: pick(priorities),
    status,
    createdAt,
    lastContact: randomDate(20),
    bedrooms: 1 + Math.floor(rand() * 5),
    bathrooms: 1 + Math.floor(rand() * 4),
    areaRequired: `${((Math.floor(rand() * 20) + 8) * 100).toLocaleString("en-IN")} sq.ft`,
    possession: rand() > 0.5 ? "Ready to Move" : "Under Construction",
    facing: pick(facings),
    parking: Math.floor(rand() * 3),
    amenities,
  };

  if (status === "Won") {
    lead.wonDetails = {
      revenue: budgetMax,
      closingDate: randomDate(30),
      propertyPurchased: `${propertyType} — ${location}`,
      commission: Math.round(budgetMax * 0.02),
    };
  } else if (status === "Lost") {
    lead.lostReason = lostReasons[i % lostReasons.length];
  }

  return lead;
});

// ---------------------------------------------------------------------------
// Lead timeline / notes / documents (Phase 3)
// ---------------------------------------------------------------------------

export type TimelineEventType =
  | "created"
  | "call"
  | "meeting"
  | "email"
  | "whatsapp"
  | "property_shared"
  | "negotiation"
  | "qualified"
  | "won"
  | "lost"
  | "note";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  author: string;
};

const stageOrder: LeadStatus[] = [
  "New", "Contacted", "Interested", "Qualified", "Negotiation", "Won", "Lost",
];

export function buildLeadTimeline(lead: Lead): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: `${lead.id}-t0`,
      type: "created",
      title: "Lead created",
      description: `Sourced via ${lead.source} and assigned to ${lead.agent}.`,
      timestamp: lead.createdAt,
      author: "System",
    },
  ];

  const reached = stageOrder.indexOf(lead.status);
  const dayStep = () => {
    const d = new Date(lead.createdAt);
    d.setDate(d.getDate() + events.length * 3);
    return d.toISOString();
  };

  if (reached >= 1)
    events.push({ id: `${lead.id}-t1`, type: "call", title: "Call made", description: "Introductory call to understand requirements.", timestamp: dayStep(), author: lead.agent });
  if (reached >= 2)
    events.push({ id: `${lead.id}-t2`, type: "property_shared", title: "Property shared", description: `Shared 3 ${lead.propertyType.toLowerCase()} options in ${lead.location}.`, timestamp: dayStep(), author: lead.agent });
  if (reached >= 3)
    events.push({ id: `${lead.id}-t3`, type: "qualified", title: "Lead qualified", description: `Budget confirmed at ${formatCurrencyPKR(lead.budgetMax)}.`, timestamp: dayStep(), author: lead.agent });
  if (reached >= 4)
    events.push({ id: `${lead.id}-t4`, type: "negotiation", title: "Negotiation started", description: "Discussing final price and payment plan.", timestamp: dayStep(), author: lead.agent });
  if (lead.status === "Won")
    events.push({ id: `${lead.id}-t5`, type: "won", title: "Deal won", description: `Closed at ${formatCurrencyPKR(lead.wonDetails?.revenue ?? lead.budgetMax)}.`, timestamp: dayStep(), author: lead.agent });
  if (lead.status === "Lost")
    events.push({ id: `${lead.id}-t5`, type: "lost", title: "Deal lost", description: `Reason: ${lead.lostReason ?? "Other"}.`, timestamp: dayStep(), author: lead.agent });

  return events.reverse();
}

export type LeadNote = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  pinned: boolean;
};

export function buildLeadNotes(lead: Lead): LeadNote[] {
  return [
    {
      id: `${lead.id}-n1`,
      author: lead.agent,
      content: `${lead.name} prefers a ${lead.bedrooms}-bed ${lead.propertyType.toLowerCase()} facing ${lead.facing}. Follow up before the weekend.`,
      timestamp: lead.lastContact,
      pinned: true,
    },
  ];
}

export type LeadDocument = {
  id: string;
  name: string;
  type: "PDF" | "Image" | "Doc";
  size: string;
  uploadedAt: string;
};

export function buildLeadDocuments(lead: Lead): LeadDocument[] {
  if (lead.status === "New") return [];
  const base: LeadDocument[] = [
    { id: `${lead.id}-d1`, name: "CNIC.pdf", type: "PDF", size: "1.2 MB", uploadedAt: lead.lastContact },
  ];
  if (["Qualified", "Negotiation", "Won"].includes(lead.status)) {
    base.push({ id: `${lead.id}-d2`, name: "Property-brochure.pdf", type: "PDF", size: "4.8 MB", uploadedAt: lead.lastContact });
  }
  if (lead.status === "Won") {
    base.push({ id: `${lead.id}-d3`, name: "Sale-agreement.pdf", type: "PDF", size: "2.1 MB", uploadedAt: lead.wonDetails?.closingDate ?? lead.lastContact });
  }
  return base;
}

export type ActivityItem = {
  id: string;
  type:
    | "lead_added"
    | "meeting_scheduled"
    | "lead_qualified"
    | "property_shared"
    | "deal_won"
    | "deal_lost";
  title: string;
  subtitle: string;
  timestamp: string;
};

export const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "deal_won",
    title: "Deal Won — Aarav Reddy",
    subtitle: "Villa in Whitefield, Bangalore · ₹3.8 Cr",
    timestamp: randomDate(1),
  },
  {
    id: "act-2",
    type: "meeting_scheduled",
    title: "Meeting Scheduled — Priya Nair",
    subtitle: "Site visit at Gachibowli, Hyderabad",
    timestamp: randomDate(1),
  },
  {
    id: "act-3",
    type: "lead_qualified",
    title: "Lead Qualified — Vikram Menon",
    subtitle: "Budget confirmed at ₹1.6 Cr",
    timestamp: randomDate(2),
  },
  {
    id: "act-4",
    type: "property_shared",
    title: "Property Shared — Ananya Iyer",
    subtitle: "3 BHK apartment, Powai, Mumbai",
    timestamp: randomDate(2),
  },
  {
    id: "act-5",
    type: "lead_added",
    title: "New Lead Added — Rohan Gupta",
    subtitle: "Sourced via 99acres",
    timestamp: randomDate(3),
  },
  {
    id: "act-6",
    type: "deal_lost",
    title: "Deal Lost — Kavya Shah",
    subtitle: "Reason: Chose a competitor",
    timestamp: randomDate(4),
  },
];

export type ScheduleItem = {
  id: string;
  kind: "Meeting" | "Call" | "Task";
  title: string;
  time: string;
  with?: string;
};

export const upcomingSchedule: ScheduleItem[] = [
  { id: "s1", kind: "Meeting", title: "Site visit — Prestige Villa", time: "10:30 AM", with: "Aarav Reddy" },
  { id: "s2", kind: "Call", title: "Follow-up call", time: "12:00 PM", with: "Priya Nair" },
  { id: "s3", kind: "Task", title: "Send updated brochure", time: "2:00 PM" },
  { id: "s4", kind: "Meeting", title: "Negotiation meeting", time: "4:30 PM", with: "Vikram Menon" },
  { id: "s5", kind: "Call", title: "Payment plan discussion", time: "5:15 PM", with: "Ananya Iyer" },
];

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "New lead assigned",
    description: "Rohan Gupta was assigned to you by Ravi Kumar.",
    timestamp: randomDate(0),
    read: false,
  },
  {
    id: "n2",
    title: "Meeting reminder",
    description: "Site visit with Aarav Reddy starts in 30 minutes.",
    timestamp: randomDate(0),
    read: false,
  },
  {
    id: "n3",
    title: "Task overdue",
    description: "\"Send updated brochure\" was due yesterday.",
    timestamp: randomDate(1),
    read: true,
  },
  {
    id: "n4",
    title: "Deal won",
    description: "Congrats! The Whitefield villa deal closed at ₹3.8 Cr.",
    timestamp: randomDate(1),
    read: true,
  },
];

// ---------------------------------------------------------------------------
// Dashboard chart data (derived + illustrative series)
// ---------------------------------------------------------------------------

function countBy<T extends string>(items: T[]): Record<string, number> {
  return items.reduce((acc, key) => {
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export const leadSourceCounts = Object.entries(countBy(leads.map((l) => l.source)))
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);

export const agentPerformance = Object.entries(countBy(leads.map((l) => l.agent)))
  .map(([name, count]) => ({
    name,
    deals: count,
    won: leads.filter((l) => l.agent === name && l.status === "Won").length,
  }))
  .sort((a, b) => b.deals - a.deals);

export const propertyCategoryCounts = Object.entries(
  countBy(leads.map((l) => l.propertyType))
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);

export const leadStatusCounts = statuses.map((status) => ({
  status,
  count: leads.filter((l) => l.status === status).length,
}));

export const pipelineFunnelData = (
  ["New", "Contacted", "Interested", "Qualified", "Negotiation", "Won"] as const
).map((stage) => ({
  stage,
  count: leads.filter((l) => l.status === stage).length,
}));

const monthLabels = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const monthlyLeadsTrend = monthLabels.map((month, i) => ({
  month,
  leads: Math.round(28 + i * 4.5 + Math.sin(i / 2) * 8),
}));

export const revenueForecastTrend = monthLabels.map((month, i) => ({
  month,
  actual: (i < 8 ? Math.round(18 + i * 3.2 + Math.cos(i) * 3) : null) as number | null,
  forecast: Math.round(18 + i * 3.6 + Math.sin(i / 3) * 4),
}));

export const conversionRate = Math.round(
  (leads.filter((l) => l.status === "Won").length /
    Math.max(leads.filter((l) => l.status === "Won" || l.status === "Lost").length, 1)) *
    100
);

export function formatCurrencyPKR(value: number) {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

// ---------------------------------------------------------------------------
// Prospects
// ---------------------------------------------------------------------------

export type Prospect = {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  budget: number;
  interestLevel: "Low" | "Medium" | "High";
  notes: string;
  createdAt: string;
};

const prospectNotes = [
  "Awaiting budget confirmation before qualifying.",
  "Comparing 2–3 projects; wants a weekend site visit.",
  "Relocating from abroad in 3 months, actively looking.",
  "Investor — interested in pre-launch pricing.",
  "First-time buyer, needs home-loan guidance.",
  "Prefers ready-to-move; not keen on under-construction.",
];

export const prospects: Prospect[] = Array.from({ length: 42 }).map((_, i) => {
  const name = `${pick(firstNames)} ${pick(lastNames)}`;
  return {
    id: `PR-${String(2000 + i)}`,
    name,
    phone: `+91 9${Math.floor(rand() * 9)}${Math.floor(1000000 + rand() * 8999999)}`,
    email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
    location: pick(locations),
    budget: (Math.floor(rand() * 40) + 10) * 1_000_000,
    interestLevel: pick(["Low", "Medium", "High"] as const),
    notes: pick(prospectNotes),
    createdAt: randomDate(60),
  };
});

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyPurchased: string;
  purchaseValue: number;
  closingDate: string;
  agent: string;
  supportRequests: number;
};

export const clients: Client[] = Array.from({ length: 34 }).map((_, i) => {
  const name = `${pick(firstNames)} ${pick(lastNames)}`;
  return {
    id: `CL-${String(3000 + i)}`,
    name,
    phone: `+91 9${Math.floor(rand() * 9)}${Math.floor(1000000 + rand() * 8999999)}`,
    email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
    propertyPurchased: `${pick(propertyTypes)} — ${pick(locations)}`,
    purchaseValue: (Math.floor(rand() * 60) + 20) * 1_000_000,
    closingDate: randomDate(200),
    agent: pick(agents),
    supportRequests: Math.floor(rand() * 4),
  };
});

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export type Task = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  leadId?: string;
  relatedLead?: string;
  priority: Priority;
  dueDate: string;
  status: "To Do" | "In Progress" | "Done";
};

const taskTitles = [
  "Send updated brochure",
  "Follow up on site visit feedback",
  "Prepare payment plan",
  "Schedule token agreement signing",
  "Verify property documents",
  "Call to confirm budget",
  "Share comparable listings",
  "Draft negotiation offer",
  "Update CRM lead notes",
  "Coordinate with legal team",
];

const taskDescriptions = [
  "Prioritise this follow-up — the client is actively comparing options.",
  "Client requested this before the next site visit.",
  "Time-sensitive: needed to keep the deal moving this week.",
  "Coordinate with the team and update the lead timeline once done.",
  "Confirm details over call, then share supporting documents.",
];

export const tasks: Task[] = Array.from({ length: 64 }).map((_, i) => {
  const lead = leads[i % leads.length];
  return {
    id: `TSK-${String(4000 + i)}`,
    title: pick(taskTitles),
    description: pick(taskDescriptions),
    assignedTo: lead.agent,
    leadId: lead.id,
    relatedLead: lead.name,
    priority: pick(priorities),
    dueDate: randomDate(-14),
    status: pick(["To Do", "In Progress", "Done"] as const),
  };
});

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export type Meeting = {
  id: string;
  title: string;
  leadId?: string;
  leadName: string;
  date: string;
  time: string;
  location: string;
  participants: string[];
  status: "Scheduled" | "Completed" | "Cancelled";
};

const meetingTitles = [
  "Site visit",
  "Negotiation meeting",
  "Contract signing",
  "Property walkthrough",
  "Investment discussion",
  "Follow-up consultation",
];

export const meetings: Meeting[] = Array.from({ length: 46 }).map((_, i) => {
  const lead = leads[(i * 2) % leads.length];
  const hour = 9 + Math.floor(rand() * 9);
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour > 12 ? hour - 12 : hour;
  return {
    id: `MTG-${String(5000 + i)}`,
    title: `${pick(meetingTitles)} — ${lead.propertyType} in ${lead.location.split(",")[0]}`,
    leadId: lead.id,
    leadName: lead.name,
    date: randomDate(-20),
    time: `${h12}:${rand() > 0.5 ? "30" : "00"} ${period}`,
    location: lead.location,
    participants: Array.from(new Set([lead.agent, pick(agents)])),
    status: pick(["Scheduled", "Completed", "Cancelled"] as const),
  };
});

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

export type CallLog = {
  id: string;
  leadId?: string;
  leadName: string;
  direction: "Incoming" | "Outgoing";
  duration: string;
  agent: string;
  summary: string;
  followUp: boolean;
  timestamp: string;
};

const callSummaries = [
  "Discussed budget expectations and shortlisted 3 properties.",
  "Explained the payment plan and home-loan tie-ups.",
  "Confirmed the site visit slot for this weekend.",
  "Answered questions on possession timeline and amenities.",
  "Negotiated final pricing; awaiting client decision.",
  "Shared brochure and floor plans over WhatsApp after the call.",
];

export const calls: CallLog[] = Array.from({ length: 82 }).map((_, i) => {
  const lead = leads[(i * 3) % leads.length];
  return {
    id: `CALL-${String(6000 + i)}`,
    leadId: lead.id,
    leadName: lead.name,
    direction: pick(["Incoming", "Outgoing"] as const),
    duration: `${Math.floor(rand() * 12) + 1}:${String(
      Math.floor(rand() * 59)
    ).padStart(2, "0")}`,
    agent: lead.agent,
    summary: pick(callSummaries),
    followUp: rand() > 0.5,
    timestamp: randomDate(30),
  };
});

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------

export type EmailThread = {
  id: string;
  subject: string;
  from: string;
  preview: string;
  body: string;
  folder: "Inbox" | "Sent" | "Drafts";
  timestamp: string;
  read: boolean;
  starred: boolean;
};

const emailSubjects = [
  "Re: Property shortlist for Whitefield",
  "Payment plan options attached",
  "Site visit confirmation — this weekend",
  "Updated price sheet — Gachibowli",
  "Contract draft for your review",
  "Thank you for visiting our office",
  "3 BHK options within your budget",
  "Home-loan pre-approval — next steps",
];

// Weighted, deterministic folder pattern (rather than a pure random pick) so every
// folder is guaranteed a healthy sample regardless of how the seeded sequence falls.
const emailFolderPattern: EmailThread["folder"][] = [
  "Inbox", "Inbox", "Sent", "Inbox", "Drafts", "Inbox",
];

export const emailThreads: EmailThread[] = Array.from({ length: 24 }).map(
  (_, i) => ({
    id: `EM-${String(7000 + i)}`,
    subject: pick(emailSubjects),
    from: pick(leads).name,
    preview:
      "Thank you for the details, I would like to schedule a visit this week to see the property in person…",
    body: "Thank you for the details, I would like to schedule a visit this week to see the property in person and discuss the payment plan options further. Please let me know your availability.",
    folder: emailFolderPattern[i % emailFolderPattern.length],
    timestamp: randomDate(15),
    read: rand() > 0.4,
    starred: rand() > 0.8,
  })
);

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export type Resource = {
  id: string;
  title: string;
  category:
    | "Sales Scripts"
    | "Property Documents"
    | "Company Policies"
    | "Training Material"
    | "FAQs"
    | "Price Sheets"
    | "Contracts"
    | "Checklists";
  type: "PDF" | "Video" | "Doc";
  tags: string[];
  updatedAt: string;
};

const resourceTitles: Record<Resource["category"], string[]> = {
  "Sales Scripts": ["Cold call opening script", "Objection handling guide", "Site-visit closing script"],
  "Property Documents": ["Title deed checklist", "RERA registration guide", "Encumbrance certificate FAQ"],
  "Company Policies": ["Code of conduct", "Leave policy", "Brokerage & incentive policy"],
  "Training Material": ["New consultant onboarding handbook", "Negotiation tactics 101", "Home-loan basics for agents"],
  FAQs: ["Buyer FAQs", "NRI investment FAQs", "Home-loan FAQs"],
  "Price Sheets": ["Whitefield project price sheet", "Gachibowli price sheet", "Powai project price sheet"],
  Contracts: ["Sale agreement template", "Rental agreement template", "Booking form template"],
  Checklists: ["Site visit checklist", "Closing checklist", "Document verification checklist"],
};

export const resources: Resource[] = Object.entries(resourceTitles).flatMap(
  ([category, titles]) =>
    titles.map((title, i) => ({
      id: `RES-${category.slice(0, 3).toUpperCase()}-${i}`,
      title,
      category: category as Resource["category"],
      type: pick(["PDF", "Video", "Doc"] as const),
      tags: [category.split(" ")[0], "2026"],
      updatedAt: randomDate(90),
    }))
);

// ---------------------------------------------------------------------------
// Internal Chat
// ---------------------------------------------------------------------------

export type ChatMessage = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  self?: boolean;
};

export type ChatConversation = {
  id: string;
  name: string;
  type: "direct" | "group";
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  online?: boolean;
  messages: ChatMessage[];
};

export const chatConversations: ChatConversation[] = [
  {
    id: "chat-1",
    name: "Ravi Kumar",
    type: "direct",
    lastMessage: "Sent the updated brochure to the client.",
    lastMessageAt: randomDate(0),
    unread: 2,
    online: true,
    messages: [
      { id: "m1", author: "Ravi Kumar", content: "Hey, did you get a chance to review the Whitefield listing?", timestamp: randomDate(0) },
      { id: "m2", author: "You", content: "Yes, looks great. Let's share it with Aarav Reddy.", timestamp: randomDate(0), self: true },
      { id: "m3", author: "Ravi Kumar", content: "Sent the updated brochure to the client.", timestamp: randomDate(0) },
    ],
  },
  {
    id: "chat-2",
    name: "Sales Team",
    type: "group",
    lastMessage: "Priya Nair: Closed the Gachibowli deal today! 🎉",
    lastMessageAt: randomDate(0),
    unread: 5,
    messages: [
      { id: "m1", author: "Priya Nair", content: "Closed the Gachibowli deal today! 🎉", timestamp: randomDate(0) },
      { id: "m2", author: "Karthik Menon", content: "Amazing work team!", timestamp: randomDate(0) },
      { id: "m3", author: "You", content: "Congrats Priya!", timestamp: randomDate(0), self: true },
    ],
  },
  {
    id: "chat-3",
    name: "Arjun Reddy",
    type: "direct",
    lastMessage: "Can you cover my 4 PM site visit?",
    lastMessageAt: randomDate(1),
    unread: 0,
    online: false,
    messages: [
      { id: "m1", author: "Arjun Reddy", content: "Stuck in traffic — can you cover my 4 PM site visit?", timestamp: randomDate(1) },
      { id: "m2", author: "You", content: "Sure, I've got it. Send me the client details.", timestamp: randomDate(1), self: true },
    ],
  },
  {
    id: "chat-4",
    name: "Operations",
    type: "group",
    lastMessage: "Deepika Rao: Price sheets for Q3 are uploaded to Resources.",
    lastMessageAt: randomDate(2),
    unread: 0,
    messages: [
      { id: "m1", author: "Deepika Rao", content: "Price sheets for Q3 are uploaded to Resources.", timestamp: randomDate(2) },
      { id: "m2", author: "Rahul Sharma", content: "Thanks, will share with my leads.", timestamp: randomDate(2) },
    ],
  },
];
