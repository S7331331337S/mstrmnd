import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CanvasVoice } from "@mstrmnd/shared";

const CANON_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "canon");

export function readCanonFile(name: string): string {
  return readFileSync(join(CANON_DIR, name), "utf8");
}

export function loadVoiceBible(voice: CanvasVoice): string {
  const file = voice === "labs" ? "voice-labs.md" : "voice-operator.md";
  return readCanonFile(file);
}

export function loadDesignTokens(): string {
  return readCanonFile("design-tokens.md");
}
