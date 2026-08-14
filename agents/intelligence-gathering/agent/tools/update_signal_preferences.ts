import { defineTool } from "eve/tools";
import { z } from "zod";
import { compactPatch } from "../../lib/patch";
import { mergeProfileField } from "../../lib/profile-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Merge signal report preferences: topics, cadence (weekly|monthly), and depth.",
  inputSchema: z.object({
    topics: z
      .array(z.string().min(1))
      .optional()
      .describe("Topics and signal sources they care about"),
    cadence: z
      .enum(["weekly", "monthly"])
      .optional()
      .describe("Preferred report cadence"),
    depth: z
      .string()
      .min(1)
      .optional()
      .describe("Desired depth, e.g. brief, operator-grade, deep dive"),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const updated = await mergeProfileField(
      userId,
      "signal_preferences",
      compactPatch(input),
    );
    return { success: true as const, updated };
  },
});
