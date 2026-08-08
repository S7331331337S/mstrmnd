import { defineTool } from "eve/tools";
import { z } from "zod";
import { failSignalReport } from "../../lib/report-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Mark a signal report as failed with a clear reason when generation cannot complete.",
  inputSchema: z.object({
    report_id: z.string().uuid().describe("signal_reports.id from start_signal_report"),
    reason: z.string().min(8).describe("Why generation failed"),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const report = await failSignalReport({
      userId,
      reportId: input.report_id,
      reason: input.reason,
    });
    return {
      success: true as const,
      report: {
        id: report.id,
        status: report.status,
        summary: report.summary,
      },
    };
  },
});
