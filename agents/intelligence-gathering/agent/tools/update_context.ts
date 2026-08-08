import { defineTool } from "eve/tools";
import { z } from "zod";
import { compactPatch } from "../../lib/patch";
import { mergeProfileField } from "../../lib/profile-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Merge operating context: tools they use, constraints, and freeform notes.",
  inputSchema: z.object({
    tools: z
      .array(z.string().min(1))
      .optional()
      .describe("Tools, systems, or stacks in active use"),
    constraints: z
      .array(z.string().min(1))
      .optional()
      .describe("Hard constraints: time, team, capital, compliance, etc."),
    notes: z
      .string()
      .min(1)
      .optional()
      .describe("Additional context that should influence advice"),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const updated = await mergeProfileField(userId, "context", compactPatch(input));
    return { success: true as const, updated };
  },
});
