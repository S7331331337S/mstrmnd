export type SubscriptionTier = "solo" | "pro" | "mastermind";

export type ConversationType = "onboarding" | "signal" | "agent" | "support";
export type ConversationStatus = "active" | "completed" | "abandoned";
export type MessageRole = "user" | "assistant" | "system" | "tool";
export type SignalPeriodType = "weekly" | "monthly";
export type SignalReportStatus = "pending" | "generating" | "ready" | "failed";
export type SignalCadence = "weekly" | "monthly";

export interface IdentityProfile {
  role?: string;
  company?: string;
  stage?: string;
  location?: string;
  primary_domains?: string[];
}

export interface GoalsProfile {
  personal?: string[];
  business?: string[];
}

export interface SignalPreferences {
  topics?: string[];
  cadence?: SignalCadence;
  depth?: string;
}

export interface StylePreferences {
  tone?: string;
  format?: string;
}

export interface ContextProfile {
  tools?: string[];
  constraints?: string[];
  notes?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  onboarding_completed: boolean;
  onboarding_started_at: string | null;
  onboarding_completed_at: string | null;
  subscription_tier: SubscriptionTier | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  identity: IdentityProfile;
  goals: GoalsProfile;
  signal_preferences: SignalPreferences;
  style_preferences: StylePreferences;
  context: ContextProfile;
  memory_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  type: ConversationType;
  title: string | null;
  status: ConversationStatus;
  eve_session_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string | null;
  tool_calls: unknown;
  tool_results: unknown;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
}

/** Structured sections written by the signal-report eve agent. */
export interface SignalReportContent {
  highlights?: string[];
  watchlist?: string[];
  decisions?: string[];
  risks?: string[];
  sources?: string[];
  [key: string]: unknown;
}

export interface SignalReport {
  id: string;
  user_id: string;
  period_type: SignalPeriodType;
  period_start: string;
  period_end: string;
  title: string | null;
  summary: string | null;
  content: SignalReportContent;
  status: SignalReportStatus;
  generated_at: string | null;
  created_at: string;
}
