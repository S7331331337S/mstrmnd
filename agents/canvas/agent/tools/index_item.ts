import { defineTool } from "eve/tools";
import { z } from "zod";
import { indexCanvasItem, markJobAwaitingApproval } from "../../lib/canvas-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Mark a drafted ce_items row indexed (tags + status). After every planned format is indexed, the job moves to awaiting_approval. CIPHER / HERALD / Slack approval are not wired yet.",
  inputSchema: z.object({
    item_id: z.string().uuid().describe("ce_items.id from a draft tool"),
    job_id: z
      .string()
      .uuid()
      .optional()
      .describe("When set, mark the job awaiting_approval after indexing this item"),
    mark_job_complete: z
      .boolean()
      .optional()
      .describe("If true, set ce_jobs.status = awaiting_approval"),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const item = await indexCanvasItem({ userId, itemId: input.item_id });
    let jobStatus: string | undefined;
    if (input.mark_job_complete && (input.job_id || item.job_id)) {
      const job = await markJobAwaitingApproval({
        userId,
        jobId: input.job_id ?? item.job_id,
      });
      jobStatus = job.status;
    }
    return {
      success: true as const,
      item: {
        id: item.id,
        format: item.format,
        status: item.status,
        metadata: item.metadata,
      },
      ...(jobStatus ? { job_status: jobStatus } : {}),
    };
  },
});
