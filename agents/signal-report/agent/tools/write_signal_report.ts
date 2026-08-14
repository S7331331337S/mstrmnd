import { defineTool } from "eve/tools";
import { z } from "zod";
import { writeSignalReport } from "../../lib/report-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Persist the finished signal report content and mark the row ready.",
  inputSchema: z.object({
    report_id: z.string().uuid().describe("signal_reports.id from start_signal_report"),
    title: z.string().min(4).describe("Short report title"),
    summary: z.string().min(20).describe("One-paragraph executive summary"),
    highlights: z.array(z.string().min(1)).min(1).describe("Key highlights"),
    watchlist: z.array(z.string().min(1)).min(1).describe("What to watch next"),
    decisions: z
      .array(z.string().min(1))
      .min(1)
      .describe("Recommended operator decisions"),
    risks: z.array(z.string().min(1)).optional().describe("Optional risks"),
    sources: z.array(z.string().min(1)).optional().describe("Optional source labels"),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const report = await writeSignalReport({
      userId,
      reportId: input.report_id,
      title: input.title,
      summary: input.summary,
      content: {
        highlights: input.highlights,
        watchlist: input.watchlist,
        decisions: input.decisions,
        ...(input.risks ? { risks: input.risks } : {}),
        ...(input.sources ? { sources: input.sources } : {}),
      },
    });
    return {
      success: true as const,
      report: {
        id: report.id,
        title: report.title,
        status: report.status,
        generated_at: report.generated_at,
      },
    };
  },
});
