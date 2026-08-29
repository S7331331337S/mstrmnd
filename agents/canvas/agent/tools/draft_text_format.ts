import { defineTool } from "eve/tools";
import { z } from "zod";
import { insertCanvasItem, loadCanvasJob } from "../../lib/canvas-write";
import { requireUserId } from "../../lib/session-user";
import { TEXT_CANVAS_FORMATS } from "@mstrmnd/shared";

export default defineTool({
  description:
    "Persist a text-format draft (press_card, linkedin, etc.) onto ce_items. OPERATOR voice is rejected if banned vocabulary is present. Do not use this for visual_spec.",
  inputSchema: z.object({
    job_id: z.string().uuid().describe("ce_jobs.id from start_canvas_job"),
    format: z
      .enum([
        "press_card",
        "linkedin",
        "x_thread",
        "email",
        "site",
        "proposal",
        "report",
      ])
      .describe("Text format to store"),
    body: z.string().min(20).describe("Finished draft in the job's voice bible"),
    model_used: z.string().min(1).optional(),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const job = await loadCanvasJob({ userId, jobId: input.job_id });
    if (!TEXT_CANVAS_FORMATS.includes(input.format)) {
      throw new Error(`Format "${input.format}" cannot be drafted with draft_text_format`);
    }
    const item = await insertCanvasItem({
      userId,
      job,
      format: input.format,
      body: input.body,
      modelUsed: input.model_used ?? "canvas-text",
      metadata: { voice: job.voice, template: job.template },
    });
    return {
      success: true as const,
      item: {
        id: item.id,
        format: item.format,
        status: item.status,
        content_ref: item.content_ref,
      },
    };
  },
});
