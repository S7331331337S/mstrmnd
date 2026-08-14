import { getServiceSupabase } from "./supabase";

type JsonObject = Record<string, unknown>;

const JSONB_FIELDS = [
  "identity",
  "goals",
  "signal_preferences",
  "style_preferences",
  "context",
] as const;

type JsonbField = (typeof JSONB_FIELDS)[number];

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base: JsonObject, patch: JsonObject): JsonObject {
  const out: JsonObject = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const existing = out[key];
    if (isObject(existing) && isObject(value)) {
      out[key] = deepMerge(existing, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Merge a JSONB profile field (or set scalar fields) using the service role.
 * JSON patches are deep-merged so tools never wipe sibling keys.
 */
export async function mergeProfileField(
  userId: string,
  field: JsonbField,
  patch: JsonObject,
): Promise<JsonObject> {
  const supabase = getServiceSupabase();
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select(field)
    .eq("id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Failed to read profiles.${field}: ${readError.message}`);
  }

  const current = isObject(existing?.[field as keyof typeof existing])
    ? (existing![field as keyof typeof existing] as JsonObject)
    : {};
  const merged = deepMerge(current, patch);

  const { data, error } = await supabase
    .from("profiles")
    .update({ [field]: merged })
    .eq("id", userId)
    .select(field)
    .single();

  if (error) {
    throw new Error(`Failed to update profiles.${field}: ${error.message}`);
  }

  return (data?.[field as keyof typeof data] as JsonObject) ?? merged;
}

export async function completeOnboardingProfile(
  userId: string,
  summary: string,
): Promise<{ onboarding_completed: boolean; memory_summary: string }> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      memory_summary: summary,
    })
    .eq("id", userId)
    .select("onboarding_completed, memory_summary")
    .single();

  if (error) {
    throw new Error(`Failed to complete onboarding: ${error.message}`);
  }

  return {
    onboarding_completed: Boolean(data.onboarding_completed),
    memory_summary: String(data.memory_summary ?? summary),
  };
}
