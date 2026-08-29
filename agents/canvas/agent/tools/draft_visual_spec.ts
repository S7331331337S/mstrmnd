import { defineTool } from "eve/tools";
import { z } from "zod";
import { insertCanvasItem, loadCanvasJob } from "../../lib/canvas-write";
import { loadDesignTokens } from "../../lib/canon";
import { requireUserId } from "../../lib/session-user";

const PALETTE = ["#0a0a0b", "#e8e2d0", "#8a8580"];

export default defineTool({
  description:
    "Persist a visual_spec (image-gen prompt block from design tokens). Skip unless the job plan includes visual_spec. Does not call an image model. Phase 2 video/audio is deferred.",
  inputSchema: z.object({
    job_id: z.string().uuid().describe("ce_jobs.id from start_canvas_job"),
    prompt: z
      .string()
      .min(20)
      .optional()
      .describe("Override image-gen prompt. Defaults to design-token BASE + image brief."),
    model_used: z.string().min(1).optional(),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const job = await loadCanvasJob({ userId, jobId: input.job_id });
    const brief = job.scout_packet.imageBrief?.trim() || job.thesis;
    const spec = {
      prompt:
        input.prompt?.trim() ||
        [
          "Dark Swiss editorial still.",
          `Obsidian ground ${PALETTE[0]}, platinum type ${PALETTE[1]}, graphite accent ${PALETTE[2]}.`,
          "No neon, no decorative gradient, no stock-handshake cliché.",
          `Subject: ${brief}`,
        ].join(" "),
      negativePrompt: "neon, rainbow gradient, cluttered UI, watermark, cartoon mascot",
      palette: PALETTE,
      aspect: "16:9",
      designTokens: loadDesignTokens(),
    };
    const item = await insertCanvasItem({
      userId,
      job,
      format: "visual_spec",
      body: JSON.stringify(spec, null, 2),
      modelUsed: input.model_used ?? "canvas-visual-spec",
      metadata: { voice: job.voice, kind: "visual_spec" },
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
