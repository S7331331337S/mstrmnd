import { defineTool } from "eve/tools";
import { z } from "zod";
import { loadUserProfile } from "../../lib/report-write";
import { requireUserId } from "../../lib/session-user";

export default defineTool({
  description:
    "Load the authenticated user's private profile (identity, goals, signal preferences, style, context, memory summary).",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const userId = requireUserId(ctx);
    const profile = await loadUserProfile(userId);
    return {
      success: true as const,
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        onboarding_completed: profile.onboarding_completed,
        subscription_tier: profile.subscription_tier,
        identity: profile.identity,
        goals: profile.goals,
        signal_preferences: profile.signal_preferences,
        style_preferences: profile.style_preferences,
        context: profile.context,
        memory_summary: profile.memory_summary,
      },
    };
  },
});
