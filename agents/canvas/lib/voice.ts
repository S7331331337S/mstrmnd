import type { CanvasVoice } from "@mstrmnd/shared";

/**
 * OPERATOR-voice banned vocabulary. Whole-word / phrase match.
 * LABS voice may use these; OPERATOR voice must not.
 */
export const OPERATOR_BANNED: readonly string[] = [
  "agentic",
  "llm",
  "gpt",
  "claude",
  "grok",
  "copilot",
  "chatbot",
  "generative ai",
  "prompt engineering",
  "neural network",
  "transformer model",
  "hallucination",
  "fine-tune",
  "fine tune",
  "rag",
  "embeddings",
  "vector database",
  "foundation model",
  "multi-agent",
  "multi agent",
  "orchestration",
  "inference",
  "artificial intelligence",
];

export class VoiceViolationError extends Error {
  readonly matches: string[];

  constructor(matches: string[]) {
    super(
      `OPERATOR voice rejected: banned vocabulary (${matches.join(", ")}). ` +
        "CIPHER is deferred — CANVAS refuses contaminated drafts at write time.",
    );
    this.name = "VoiceViolationError";
    this.matches = matches;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findBannedVocabulary(text: string): string[] {
  const haystack = text.toLowerCase();
  const hits: string[] = [];

  for (const phrase of OPERATOR_BANNED) {
    const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "i");
    if (pattern.test(haystack)) hits.push(phrase);
  }

  if (/\ba\.?i\.?\b/i.test(haystack)) hits.push("AI");

  return [...new Set(hits)];
}

export function assertVoice(voice: CanvasVoice, body: string): void {
  if (voice !== "operator") return;
  const matches = findBannedVocabulary(body);
  if (matches.length > 0) {
    throw new VoiceViolationError(matches);
  }
}
