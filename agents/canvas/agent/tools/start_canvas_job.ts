import { defineTool } from "eve/tools";
import { z } from "zod";
import { startCanvasJob } from "../../lib/canvas-write";
import { requireUserId } from "../../lib/session-user";

const formatEnum = z.enum([
  "press_card",
  "linkedin",
  "x_thread",
  "email",
  "site",
  "proposal",
  "report",
  "visual_spec",
]);

export default defineTool({
  description:
    "Open a ce_jobs row from a DESK-shaped payload and return the parallel format plan. Call this first.",
  inputSchema: z.object({
    template: formatEnum.describe("Primary template DESK classified"),
    voice: z.enum(["labs", "operator"]).describe("LABS or OPERATOR bible"),
    thesis: z.string().min(8).describe("One thesis to fan out across formats"),
    source: z.enum(["manual", "calendar", "trigger"]).optional(),
    touchpoint: z
      .enum([
        "discovery",
        "conversion",
        "onboarding",
        "delivery",
        "retention",
        "brand",
      ])
      .optional(),
    formats: z
      .array(formatEnum)
      .min(1)
      .optional()
      .describe("Formats to draft in parallel. Defaults to press_card + linkedin."),
    image_brief: z
      .string()
      .min(1)
      .optional()
      .describe("SCOUT image brief. Required for visual_spec to be planned."),
    citations: z.array(z.string().min(1)).optional(),
    priority: z.number().int().min(1).max(5).optional(),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const { job, plan, bible } = await startCanvasJob({
      userId,
      template: input.template,
      voice: input.voice,
      thesis: input.thesis,
      source: input.source,
      touchpoint: input.touchpoint,
      formats: input.formats,
      scoutPacket: {
        thesis: input.thesis,
        ...(input.image_brief ? { imageBrief: input.image_brief } : {}),
        ...(input.citations ? { citations: input.citations } : {}),
      },
      priority: input.priority,
    });
    return {
      success: true as const,
      job: {
        id: job.id,
        voice: job.voice,
        template: job.template,
        status: job.status,
        formats: job.formats,
      },
      plan,
      voice_bible: bible,
    };
  },
});
