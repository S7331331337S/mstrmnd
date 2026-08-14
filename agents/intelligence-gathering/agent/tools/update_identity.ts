import { defineTool } from "eve/tools";
import { z } from "zod";
import { compactPatch } from "../../lib/patch";
import { mergeProfileField } from "../../lib/profile-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Merge identity fields into the user's private profile: role, company, stage, location, and primary domains.",
  inputSchema: z.object({
    role: z.string().min(1).optional().describe("Current role or title"),
    company: z.string().min(1).optional().describe("Company or venture name"),
    stage: z
      .string()
      .min(1)
      .optional()
      .describe("Company/career stage, e.g. pre-seed, growth, operator"),
    location: z.string().min(1).optional().describe("City, region, or timezone context"),
    primary_domains: z
      .array(z.string().min(1))
      .optional()
      .describe("Primary domains of focus"),
  }),
  async execute(input, ctx) {
    const userId = requireUserId(ctx);
    const updated = await mergeProfileField(userId, "identity", compactPatch(input));
    return { success: true as const, updated };
  },
});
