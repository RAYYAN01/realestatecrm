// Demo "AI" generators. These are deterministic, data-driven templates that
// simulate an assistant — they read real record data and compose insight text
// with a short artificial latency. Swap these for a real Claude API call
// (see the claude-api skill) when a backend is available.

import { formatCurrencyPKR, type Lead, type TimelineEvent } from "@/lib/mock-data";

export function simulateLatency(ms = 900) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function generateLeadSummary(lead: Lead, timeline: TimelineEvent[]): string {
  const stageNarrative: Record<Lead["status"], string> = {
    New: "just entered the pipeline and needs a first touch",
    Contacted: "has been contacted and is early in the journey",
    Interested: "is showing genuine interest and is worth nurturing",
    Qualified: "is qualified with a confirmed budget — a strong opportunity",
    Negotiation: "is in active negotiation and close to a decision",
    Won: "has converted into a closed deal",
    Lost: "did not convert and is currently inactive",
  };

  const interactions = timeline.filter((t) => t.type !== "created").length;
  const budget = `${formatCurrencyPKR(lead.budgetMin)}–${formatCurrencyPKR(lead.budgetMax)}`;

  const recommendation =
    lead.status === "Negotiation"
      ? "Prioritise a closing call this week and prepare a final payment plan."
      : lead.status === "Qualified"
      ? "Share 2–3 shortlisted properties and schedule a site visit."
      : lead.status === "Lost"
      ? "Consider a re-engagement campaign in 30–60 days."
      : lead.status === "Won"
      ? "Move to onboarding and request a referral."
      : "Make an introductory call to understand requirements in depth.";

  return [
    `${lead.name} is a ${lead.priority.toLowerCase()}-priority ${lead.purpose.toLowerCase()} lead who ${stageNarrative[lead.status]}.`,
    `They are looking for a ${lead.bedrooms}-bed ${lead.propertyType.toLowerCase()} in ${lead.location} within a budget of ${budget}, sourced via ${lead.source}.`,
    `There ${interactions === 1 ? "has been 1 interaction" : `have been ${interactions} interactions`} logged so far, managed by ${lead.agent}.`,
    `Recommended next step: ${recommendation}`,
  ].join(" ");
}

export function generateEmailDraft(input: {
  recipient?: string;
  topic?: string;
  tone?: "Professional" | "Friendly" | "Concise";
}): { subject: string; body: string } {
  const name = input.recipient?.trim() || "there";
  const topic = input.topic?.trim() || "your property search";
  const tone = input.tone ?? "Professional";

  const openers: Record<string, string> = {
    Professional: `Dear ${name},`,
    Friendly: `Hi ${name},`,
    Concise: `Hello ${name},`,
  };

  const bodies: Record<string, string> = {
    Professional: `Thank you for your continued interest regarding ${topic}. Based on our recent conversation, I've shortlisted a few options that closely match your requirements and budget. I would be glad to arrange a site visit at your convenience this week.\n\nPlease let me know a suitable time, and I will coordinate the details.\n\nWarm regards,\nSara Ahmed\nNaaz AI Labs`,
    Friendly: `Great speaking with you about ${topic}! I've found a couple of places I think you'll really like — they tick most of the boxes we discussed. Want me to set up a quick viewing this weekend?\n\nLooking forward to hearing from you.\n\nCheers,\nSara Ahmed\nNaaz AI Labs`,
    Concise: `Following up on ${topic}. I have 2–3 matching options ready and can arrange viewings this week. Which day works best for you?\n\nBest,\nSara Ahmed\nNaaz AI Labs`,
  };

  return {
    subject: `Regarding ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    body: `${openers[tone]}\n\n${bodies[tone]}`,
  };
}
