/** Local UI preview when Supabase/Docker is unavailable. */
export function isUiPreview(): boolean {
  return process.env.NEXT_PUBLIC_UI_PREVIEW === "1";
}

export const PREVIEW_PROFILE = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Operator Zero",
  avatar_url: null,
  email: "operator@mstrmnd.ai",
  onboarding_completed: true,
  onboarding_started_at: new Date().toISOString(),
  onboarding_completed_at: new Date().toISOString(),
  subscription_tier: "pro" as const,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  identity: {
    role: "Founder",
    company: "Northline",
    stage: "seed",
    location: "Los Angeles",
    primary_domains: ["B2B SaaS", "ops automation"],
  },
  goals: {
    personal: ["Protect deep-work mornings"],
    business: ["Close 8 design partners", "Ship intelligence layer MVP"],
  },
  signal_preferences: {
    topics: ["agent infra", "AI distribution", "vertical SaaS"],
    cadence: "weekly" as const,
    depth: "operator-grade",
  },
  style_preferences: {
    tone: "direct",
    format: "bullets + decisions",
  },
  context: {
    tools: ["Cursor", "Supabase", "Vercel", "Stripe"],
    constraints: ["Solo operator bandwidth"],
    notes: "Prefer systems over one-off automations",
  },
  memory_summary:
    "Founder of Northline building an intelligence layer. Weekly operator-grade signals on agent infra and distribution. Direct tone, bullets + decisions.",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
