import { defineTool } from "eve/tools";
import { z } from "zod";
import { completeOnboardingProfile } from "../../lib/profile-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Finalize onboarding after the user confirms the seeded profile summary. Sets onboarding_completed and stores memory_summary.",
  inputSchema: z.object({
    summary: z
      .string()
      .min(20)
      .describe("Confirmed high-signal summary of the seeded profile"),
  }),
  async execute({ summary }, ctx) {
    const userId = requireUserId(ctx);
    const updated = await completeOnboardingProfile(userId, summary);
    return { success: true as const, updated };
  },
});
