"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { continueEveSession, eveStreamUrl, startEveSession } from "@/lib/eve";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

const OPENING =
  "Welcome to Mstrmnd. What are you building or leading right now — role and company first.";

const PREVIEW_REPLIES = [
  "Got it — seeding identity. What outcomes matter most over the next 90 days, personally and for the business?",
  "Locked those goals. For signal reports: which topics should I watch, and do you want weekly or monthly depth?",
  "Profile is taking shape. Prefer a direct tone with bullets + decisions, or something warmer?",
  "Seeded. Here's the summary: founder building an intelligence layer; weekly operator-grade signals; direct format. Confirm to finish onboarding?",
];

export function OnboardingChat() {
  const preview = process.env.NEXT_PUBLIC_UI_PREVIEW === "1";
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "opening", role: "assistant", content: OPENING },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewStep, setPreviewStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => (preview ? null : createClient()), [preview]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function getAccessToken() {
    if (!supabase) throw new Error("Not signed in");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Not signed in");
    return token;
  }

  async function attachStream(nextSessionId: string, accessToken: string) {
    const response = await fetch(eveStreamUrl(nextSessionId), {
      headers: { authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to open eve stream (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const event = JSON.parse(trimmed) as {
            delta?: string;
            text?: string;
            content?: string;
          };
          const chunk =
            event.delta ??
            event.text ??
            (typeof event.content === "string" ? event.content : "");
          if (!chunk) continue;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: `${message.content}${chunk}` }
                : message,
            ),
          );
        } catch {
          // Ignore non-JSON keepalives / partial frames.
        }
      }
    }
  }

  async function sendPreview(text: string) {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 450));
    const reply =
      PREVIEW_REPLIES[Math.min(previewStep, PREVIEW_REPLIES.length - 1)];
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: "assistant", content: reply },
    ]);
    const next = previewStep + 1;
    setPreviewStep(next);
    if (next >= PREVIEW_REPLIES.length) setComplete(true);
    setBusy(false);
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
    ]);

    if (preview) {
      await sendPreview(text);
      return;
    }

    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      if (!sessionId) {
        const started = await startEveSession(text, accessToken);
        if (!started.sessionId) {
          throw new Error("eve did not return a session id");
        }
        setSessionId(started.sessionId);
        await attachStream(started.sessionId, accessToken);
      } else {
        await continueEveSession(sessionId, text, accessToken);
        await attachStream(sessionId, accessToken);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the intelligence-gathering agent",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[min(72vh,680px)] flex-col overflow-hidden rounded-2xl border border-zinc-800/90 bg-black/40 shadow-[0_0_0_1px_rgba(232,226,208,0.04)] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Session
          </div>
          <div className="text-sm text-zinc-200">Intelligence gathering</div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--platinum)]">
          eve
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-10 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-100"
                : "mr-10 rounded-xl border border-[var(--platinum-dim)] bg-[rgba(232,226,208,0.04)] px-3.5 py-2.5 text-sm text-zinc-200"
            }
          >
            <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {message.role === "user" ? "You" : "eve"}
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">
              {message.content || (busy ? "…" : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {complete ? (
        <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
          <p className="text-xs text-zinc-400">
            Preview onboarding complete — open the seeded dashboard.
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={sendMessage}
          className="flex gap-2 border-t border-zinc-800 p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Answer in a sentence or two…"
            disabled={busy}
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            Send
          </Button>
        </form>
      )}
      {error ? (
        <p className="border-t border-zinc-800 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
