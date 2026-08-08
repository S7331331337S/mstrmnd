export type {
  SubscriptionTier,
  ConversationType,
  ConversationStatus,
  MessageRole,
  SignalPeriodType,
  SignalReportStatus,
  SignalCadence,
  IdentityProfile,
  GoalsProfile,
  SignalPreferences,
  StylePreferences,
  ContextProfile,
  Profile,
  Conversation,
  Message,
  SignalReport,
} from "./profile";

export const STRIPE_TIERS = {
  solo: { name: "Solo", priceUsd: 49 },
  pro: { name: "Pro", priceUsd: 149 },
  mastermind: { name: "Mastermind", priceUsd: 349 },
} as const;
