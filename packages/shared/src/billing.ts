import type { SubscriptionTier } from "./profile";

export type StripeTierConfig = {
  id: SubscriptionTier;
  name: string;
  priceUsd: number;
  description: string;
  features: string[];
  /** Env var name holding the Stripe Price ID */
  priceEnv: string;
};

export const STRIPE_TIERS: Record<SubscriptionTier, StripeTierConfig> = {
  solo: {
    id: "solo",
    name: "Solo",
    priceUsd: 49,
    description: "Personal intelligence layer for a single operator.",
    features: [
      "Private profile + onboarding",
      "Weekly signal reports",
      "1 active mastermind thread",
    ],
    priceEnv: "STRIPE_PRICE_SOLO",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceUsd: 149,
    description: "Operator-grade signals for growing companies.",
    features: [
      "Everything in Solo",
      "Weekly + monthly signal reports",
      "Priority model routing",
      "Attachment-rich onboarding context",
    ],
    priceEnv: "STRIPE_PRICE_PRO",
  },
  mastermind: {
    id: "mastermind",
    name: "Mastermind",
    priceUsd: 349,
    description: "Full personal/business mastermind operating system.",
    features: [
      "Everything in Pro",
      "Multi-thread mastermind",
      "Custom signal topics",
      "Highest concurrency + support",
    ],
    priceEnv: "STRIPE_PRICE_MASTERMIND",
  },
};

export const STRIPE_TIER_LIST = Object.values(STRIPE_TIERS);
