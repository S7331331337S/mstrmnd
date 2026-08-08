"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

export function OnboardingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "opening", role: "assistant", content: OPENING },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function getAccessToken() {
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
    let assistantId = `a-${Date.now()}`;
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
            type?: string;
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

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setBusy(true);
    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
    ]);

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
    <div className="flex h-[min(70vh,640px)] flex-col rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-8 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                : "mr-8 rounded-lg border border-zinc-800/80 bg-black/40 px-3 py-2 text-sm text-zinc-200"
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
      {error ? (
        <p className="border-t border-zinc-800 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
