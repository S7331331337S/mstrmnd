import type { SupabaseClient } from "@supabase/supabase-js";

const PREVIEW_CONVERSATION_KEY = "mstrmnd.preview.onboarding.conversation";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PersistableRole = "user" | "assistant" | "system" | "tool";

export type PersistableMessage = {
  id?: string;
  role: PersistableRole;
  content: string;
  toolCalls?: unknown;
  toolResults?: unknown;
};

function isUuid(value?: string): value is string {
  return Boolean(value && UUID_RE.test(value));
}

export async function ensureOnboardingConversation(
  supabase: SupabaseClient,
  userId: string,
  eveSessionId?: string | null,
): Promise<{ id: string; status: string }> {
  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id, eve_session_id, status")
    .eq("user_id", userId)
    .eq("type", "onboarding")
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to load onboarding conversation: ${existingError.message}`);
  }

  if (existing?.id) {
    if (eveSessionId && existing.eve_session_id !== eveSessionId) {
      await supabase
        .from("conversations")
        .update({ eve_session_id: eveSessionId })
        .eq("id", existing.id);
    }
    return { id: existing.id, status: existing.status };
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      type: "onboarding",
      title: "Intelligence gathering",
      status: "active",
      eve_session_id: eveSessionId ?? null,
      metadata: { source: "web" },
    })
    .select("id, status")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create onboarding conversation: ${error?.message}`);
  }

  return { id: data.id, status: data.status };
}

export async function loadConversationMessages(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<PersistableMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, tool_calls, tool_results")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load messages: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role as PersistableRole,
    content: row.content ?? "",
    toolCalls: row.tool_calls,
    toolResults: row.tool_results,
  }));
}

export async function persistMessage(
  supabase: SupabaseClient,
  params: {
    conversationId: string;
    userId: string;
    message: PersistableMessage;
  },
): Promise<string> {
  const { conversationId, userId, message } = params;
  const row: Record<string, unknown> = {
    conversation_id: conversationId,
    user_id: userId,
    role: message.role,
    content: message.content,
    tool_calls: message.toolCalls ?? null,
    tool_results: message.toolResults ?? null,
  };
  // Client chat ids are not always UUIDs; only persist valid ones.
  if (isUuid(message.id)) {
    row.id = message.id;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert(row)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to persist message: ${error?.message}`);
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data.id;
}

export async function completeOnboardingConversation(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    throw new Error(`Failed to complete conversation: ${error.message}`);
  }
}

/** Preview-mode persistence (localStorage) when Supabase is unavailable. */
export function loadPreviewConversation(): {
  conversationId: string;
  messages: PersistableMessage[];
  complete: boolean;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREVIEW_CONVERSATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      conversationId: string;
      messages: PersistableMessage[];
      complete: boolean;
    };
  } catch {
    return null;
  }
}

export function savePreviewConversation(state: {
  conversationId: string;
  messages: PersistableMessage[];
  complete: boolean;
}): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREVIEW_CONVERSATION_KEY, JSON.stringify(state));
}
