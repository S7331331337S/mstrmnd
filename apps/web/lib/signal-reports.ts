import type { SignalPeriodType, SignalReport } from "@mstrmnd/shared";
import { PREVIEW_PROFILE } from "@/lib/preview";

const PREVIEW_REPORTS_KEY = "mstrmnd.preview.signal_reports";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function defaultPreviewPeriod(periodType: SignalPeriodType): {
  period_start: string;
  period_end: string;
} {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (periodType === "monthly" ? 29 : 6));
  return { period_start: isoDate(start), period_end: isoDate(end) };
}

export const PREVIEW_SIGNAL_REPORTS: SignalReport[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    user_id: PREVIEW_PROFILE.id,
    period_type: "weekly",
    period_start: "2026-08-01",
    period_end: "2026-08-07",
    title: "Weekly signals · agent infra",
    summary:
      "Operator-grade brief for Northline: distribution channels for AI tooling are consolidating; prioritize design-partner loops over broad launch noise.",
    content: {
      highlights: [
        "AI distribution is shifting from launch theater to proof-backed workflows",
        "Vertical SaaS buyers want agent ops, not model demos",
        "Solo-operator bandwidth remains the binding constraint",
      ],
      watchlist: ["agent infra pricing", "design-partner conversion", "Connect tool coverage"],
      decisions: [
        "Ship one intelligence loop end-to-end before expanding topics",
        "Keep weekly cadence until 8 design partners close",
      ],
      risks: ["Context dilution if topics expand too fast"],
      sources: ["profile goals", "signal preferences"],
    },
    status: "ready",
    generated_at: "2026-08-07T18:00:00.000Z",
    created_at: "2026-08-07T18:00:00.000Z",
  },
];

export function loadPreviewSignalReports(): SignalReport[] {
  if (typeof window === "undefined") return PREVIEW_SIGNAL_REPORTS;
  try {
    const raw = window.localStorage.getItem(PREVIEW_REPORTS_KEY);
    if (!raw) return PREVIEW_SIGNAL_REPORTS;
    const parsed = JSON.parse(raw) as SignalReport[];
    return parsed.length ? parsed : PREVIEW_SIGNAL_REPORTS;
  } catch {
    return PREVIEW_SIGNAL_REPORTS;
  }
}

export function savePreviewSignalReports(reports: SignalReport[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREVIEW_REPORTS_KEY, JSON.stringify(reports));
}

export function buildPreviewSignalReport(
  periodType: SignalPeriodType = "weekly",
): SignalReport {
  const window = defaultPreviewPeriod(periodType);
  const topics = PREVIEW_PROFILE.signal_preferences.topics ?? ["signals"];
  return {
    id: crypto.randomUUID(),
    user_id: PREVIEW_PROFILE.id,
    period_type: periodType,
    period_start: window.period_start,
    period_end: window.period_end,
    title: `${periodType === "monthly" ? "Monthly" : "Weekly"} signals · ${topics[0]}`,
    summary:
      "Preview-generated brief from the seeded Northline profile. Wire the signal-report eve agent + Supabase for live generation.",
    content: {
      highlights: [
        `Focus spine: ${topics.join(", ")}`,
        "Keep cadence tight while onboarding design partners",
        "Prefer systems that compound over one-off research dumps",
      ],
      watchlist: topics,
      decisions: [
        "Generate the next live report after Stripe + eve are bound",
        "Protect deep-work mornings for report review",
      ],
      risks: ["Preview mode does not hit the live agent"],
      sources: ["preview profile"],
    },
    status: "ready",
    generated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}
