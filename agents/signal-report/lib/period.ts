import type { SignalPeriodType } from "@mstrmnd/shared";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Compute inclusive period window ending today (UTC). */
export function defaultPeriodWindow(periodType: SignalPeriodType): {
  period_start: string;
  period_end: string;
} {
  const end = new Date();
  const start = new Date(end);

  if (periodType === "monthly") {
    start.setUTCDate(start.getUTCDate() - 29);
  } else {
    start.setUTCDate(start.getUTCDate() - 6);
  }

  return {
    period_start: isoDate(start),
    period_end: isoDate(end),
  };
}
