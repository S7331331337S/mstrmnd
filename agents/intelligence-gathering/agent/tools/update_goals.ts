import { defineTool } from "eve/tools";
import { z } from "zod";
import { compactPatch } from "../../lib/patch";
import { mergeProfileField } from "../../lib/profile-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Merge personal and business goals into the user's private profile.",
  inputSchema: z.object({
    personal: z
      .array(z.string().min(1))
      .optional()
      .describe("Personal goals or outcomes"),
    business: z
      .array(z.string().min(1))
      .optional()
      .describe("Business goals or outcomes"),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const updated = await mergeProfileField(userId, "goals", compactPatch(input));
    return { success: true as const, updated };
  },
});
