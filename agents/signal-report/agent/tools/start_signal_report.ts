import { defineTool } from "eve/tools";
import { z } from "zod";
import { startSignalReport } from "../../lib/report-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Create a signal_reports row in generating status for the authenticated user. Prefer weekly/monthly from profile cadence.",
  inputSchema: z.object({
    period_type: z
      .enum(["weekly", "monthly"])
      .describe("Report cadence window"),
    period_start: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Inclusive start date YYYY-MM-DD"),
    period_end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Inclusive end date YYYY-MM-DD"),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const report = await startSignalReport({
      userId,
      periodType: input.period_type,
      periodStart: input.period_start,
      periodEnd: input.period_end,
    });
    return {
      success: true as const,
      report: {
        id: report.id,
        period_type: report.period_type,
        period_start: report.period_start,
        period_end: report.period_end,
        status: report.status,
      },
    };
  },
});
