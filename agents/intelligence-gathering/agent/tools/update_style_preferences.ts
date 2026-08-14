import { defineTool } from "eve/tools";
import { z } from "zod";
import { compactPatch } from "../../lib/patch";
import { mergeProfileField } from "../../lib/profile-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Merge communication style preferences for reports and advice: tone and format.",
  inputSchema: z.object({
    tone: z
      .string()
      .min(1)
      .optional()
      .describe("Preferred tone, e.g. direct, warm, analytical"),
    format: z
      .string()
      .min(1)
      .optional()
      .describe("Preferred format, e.g. bullets, narrative, scorecards"),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const updated = await mergeProfileField(
      userId,
      "style_preferences",
      compactPatch(input),
    );
    return { success: true as const, updated };
  },
});
