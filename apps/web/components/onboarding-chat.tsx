"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ChatStatus, FileUIPart } from "ai";
import { CopyIcon, GlobeIcon, MicIcon, PaperclipIcon } from "lucide-react";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import {
  completeOnboardingConversation,
  ensureOnboardingConversation,
  loadConversationMessages,
  loadPreviewConversation,
  persistMessage,
  savePreviewConversation,
} from "@/lib/chat-persistence";
import { continueEveSession, eveStreamUrl, startEveSession } from "@/lib/eve";
import { createClient } from "@/lib/supabase/client";

type ChatAttachment = FileUIPart & { id: string };

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: ChatAttachment[];
  persisted?: boolean;
};

const OPENING =
  "Welcome to Mstrmnd. What are you building or leading right now — role and company first.";

const PREVIEW_REPLIES = [
  "Got it — seeding identity. What outcomes matter most over the next 90 days, personally and for the business?",
  "Locked those goals. For signal reports: which topics should I watch, and do you want weekly or monthly depth?",
  "Profile is taking shape. Prefer a direct tone with bullets + decisions, or something warmer?",
  "Seeded. Here's the summary: founder building an intelligence layer; weekly operator-grade signals; direct format. Confirm to finish onboarding?",
];

const SUGGESTIONS = [
  "Founder at a seed-stage B2B SaaS",
  "Close 8 design partners this quarter",
  "Weekly operator-grade signals",
  "Direct tone, bullets + decisions",
];

const MODELS = [
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" },
  { id: "openai/gpt-5.4", name: "GPT-5.4" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
];

function PromptAttachments() {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;

  return (
    <Attachments variant="inline" className="w-full">
      {attachments.files.map((file) => (
        <Attachment
          key={file.id}
          data={file}
          onRemove={() => attachments.remove(file.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

export function OnboardingChat() {
  const preview = process.env.NEXT_PUBLIC_UI_PREVIEW === "1";
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "opening", role: "assistant", content: OPENING, persisted: true },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [error, setError] = useState<string | null>(null);
  const [previewStep, setPreviewStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [model, setModel] = useState(MODELS[0].id);
  const [webSearch, setWebSearch] = useState(false);
  const [listening, setListening] = useState(false);
  const hydrated = useRef(false);
  const supabase = useMemo(() => (preview ? null : createClient()), [preview]);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    if (preview) {
      const saved = loadPreviewConversation();
      const id = saved?.conversationId ?? crypto.randomUUID();
      setConversationId(id);
      if (saved?.messages?.length) {
        setMessages(
          saved.messages.map((message) => ({
            id: message.id ?? crypto.randomUUID(),
            role: message.role === "assistant" ? "assistant" : "user",
            content: message.content,
            persisted: true,
          })),
        );
        setPreviewStep(Math.max(0, saved.messages.filter((m) => m.role === "user").length));
        setComplete(Boolean(saved.complete));
      } else {
        savePreviewConversation({
          conversationId: id,
          messages: [{ id: "opening", role: "assistant", content: OPENING }],
          complete: false,
        });
      }
      return;
    }

    void (async () => {
      try {
        if (!supabase) return;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const conversation = await ensureOnboardingConversation(
          supabase,
          user.id,
        );
        setConversationId(conversation.id);
        setComplete(conversation.status === "completed");
        const existing = await loadConversationMessages(
          supabase,
          conversation.id,
        );
        if (existing.length > 0) {
          setMessages(
            existing
              .filter(
                (message) =>
                  message.role === "user" || message.role === "assistant",
              )
              .map((message) => ({
                id: message.id ?? crypto.randomUUID(),
                role: message.role as "user" | "assistant",
                content: message.content,
                persisted: true,
              })),
          );
        } else {
          await persistMessage(supabase, {
            conversationId: conversation.id,
            userId: user.id,
            message: { role: "assistant", content: OPENING },
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not initialize onboarding conversation",
        );
      }
    })();
  }, [preview, supabase]);

  useEffect(() => {
    if (!preview || !conversationId) return;
    savePreviewConversation({
      conversationId,
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
      })),
      complete,
    });
  }, [preview, conversationId, messages, complete]);

  async function getAccessToken() {
    if (!supabase) throw new Error("Not signed in");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Not signed in");
    return token;
  }

  async function persistChatMessage(message: ChatMessage) {
    if (preview || !supabase || !conversationId || !userId) return;
    await persistMessage(supabase, {
      conversationId,
      userId,
      message: {
        id: message.id,
        role: message.role,
        content: message.content,
        toolResults: message.files ? { files: message.files } : undefined,
      },
    });
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
    let content = "";
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
          content += chunk;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: `${message.content}${chunk}` }
                : message,
            ),
          );
        } catch {
          // ignore keepalives
        }
      }
    }

    await persistChatMessage({
      id: assistantId,
      role: "assistant",
      content,
    });
    return content;
  }

  async function sendPreview(text: string, files?: ChatAttachment[]) {
    setStatus("submitted");
    await new Promise((r) => setTimeout(r, 280));
    setStatus("streaming");
    await new Promise((r) => setTimeout(r, 420));
    const reply =
      PREVIEW_REPLIES[Math.min(previewStep, PREVIEW_REPLIES.length - 1)];
    const attachmentNote =
      files && files.length > 0
        ? `\n\n_Noted ${files.length} attachment${files.length > 1 ? "s" : ""} for context._`
        : "";
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: `${reply}${attachmentNote}`,
        persisted: true,
      },
    ]);
    const next = previewStep + 1;
    setPreviewStep(next);
    if (next >= PREVIEW_REPLIES.length) setComplete(true);
    setStatus("ready");
  }

  async function handleSubmit(message: PromptInputMessage) {
    const text = message.text.trim();
    const files = message.files ?? [];
    if ((!text && files.length === 0) || status === "streaming" || complete) {
      return;
    }

    const attachments: ChatAttachment[] = files.map((file, index) => ({
      ...file,
      id:
        ("id" in file && typeof file.id === "string" && file.id) ||
        `file-${Date.now()}-${index}`,
    }));

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text || "Shared attachments for context.",
      files: attachments,
    };

    setError(null);
    setMessages((prev) => [...prev, userMessage]);

    if (preview) {
      await sendPreview(userMessage.content, attachments);
      return;
    }

    setStatus("submitted");
    try {
      if (supabase && userId) {
        const conversation =
          conversationId != null
            ? { id: conversationId }
            : await ensureOnboardingConversation(supabase, userId, sessionId);
        setConversationId(conversation.id);
        await persistMessage(supabase, {
          conversationId: conversation.id,
          userId,
          message: {
            id: userMessage.id,
            role: "user",
            content: userMessage.content,
            toolResults: attachments.length ? { files: attachments } : undefined,
          },
        });
      }

      const accessToken = await getAccessToken();
      const payload = [
        text,
        files.length
          ? `[attachments: ${files.map((f) => f.filename ?? f.mediaType).join(", ")}]`
          : "",
        webSearch ? "[web_search: on]" : "",
        `[model: ${model}]`,
      ]
        .filter(Boolean)
        .join("\n");

      setStatus("streaming");
      if (!sessionId) {
        const started = await startEveSession(payload, accessToken);
        if (!started.sessionId) throw new Error("eve did not return a session id");
        setSessionId(started.sessionId);
        if (supabase && userId) {
          const conversation = await ensureOnboardingConversation(
            supabase,
            userId,
            started.sessionId,
          );
          setConversationId(conversation.id);
        }
        await attachStream(started.sessionId, accessToken);
      } else {
        await continueEveSession(sessionId, payload, accessToken);
        await attachStream(sessionId, accessToken);
      }
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the intelligence-gathering agent",
      );
    }
  }

  async function finishOnboarding() {
    if (preview) {
      setComplete(true);
      return;
    }
    if (supabase && conversationId) {
      await completeOnboardingConversation(supabase, conversationId);
    }
    setComplete(true);
  }

  function onSuggestion(text: string) {
    void handleSubmit({ text, files: [] });
  }

  function toggleSpeech() {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (
            window as unknown as {
              SpeechRecognition?: new () => SpeechRecognitionLike;
              webkitSpeechRecognition?: new () => SpeechRecognitionLike;
            }
          ).SpeechRecognition ||
          (
            window as unknown as {
              webkitSpeechRecognition?: new () => SpeechRecognitionLike;
            }
          ).webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognition) {
      setError("Speech recognition is not available in this browser.");
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) void handleSubmit({ text: transcript, files: [] });
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  function copyMessage(content: string) {
    void navigator.clipboard?.writeText(content);
  }

  return (
    <div className="flex h-[min(78vh,760px)] flex-col overflow-hidden rounded-2xl border border-zinc-800/90 bg-black/45 shadow-[0_0_0_1px_rgba(232,226,208,0.04)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Session
          </div>
          <div className="truncate text-sm text-zinc-200">
            Intelligence gathering
          </div>
          {conversationId ? (
            <div className="mt-1 truncate text-[10px] text-zinc-600">
              conv {conversationId.slice(0, 8)}
              {preview ? " · local persist" : " · supabase"}
            </div>
          ) : null}
        </div>
        <div className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-[var(--platinum)]">
          eve · {MODELS.find((m) => m.id === model)?.name}
        </div>
      </div>

      <Conversation className="relative flex-1">
        <ConversationContent className="gap-4 px-3 py-4 sm:px-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Start onboarding"
              description="Tell eve what you’re building. Attach notes or screenshots anytime."
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent
                  className={
                    message.role === "assistant"
                      ? "border border-[var(--platinum-dim)] bg-[rgba(232,226,208,0.04)]"
                      : "border border-zinc-800 bg-zinc-900/90"
                  }
                >
                  {message.files && message.files.length > 0 ? (
                    <Attachments variant="grid" className="mb-2">
                      {message.files.map((file) => (
                        <Attachment key={file.id} data={file}>
                          <AttachmentPreview />
                        </Attachment>
                      ))}
                    </Attachments>
                  ) : null}
                  <MessageResponse className="text-sm leading-relaxed text-zinc-200">
                    {message.content || (status === "streaming" ? "…" : "")}
                  </MessageResponse>
                  {message.role === "assistant" && message.content ? (
                    <MessageActions className="mt-2 opacity-80">
                      <MessageAction
                        tooltip="Copy"
                        label="Copy"
                        onClick={() => copyMessage(message.content)}
                      >
                        <CopyIcon className="size-3.5" />
                      </MessageAction>
                    </MessageActions>
                  ) : null}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {!complete ? (
        <div className="space-y-2 border-t border-zinc-800 p-2 sm:p-3">
          <Suggestions className="px-1">
            {SUGGESTIONS.map((item) => (
              <Suggestion
                key={item}
                suggestion={item}
                onClick={onSuggestion}
                className="border-zinc-800 bg-zinc-950/70 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              />
            ))}
          </Suggestions>

          <PromptInput
            onSubmit={handleSubmit}
            className="border-zinc-800 bg-zinc-950/60"
            globalDrop
            multiple
          >
            <PromptInputHeader>
              <PromptAttachments />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Answer in a sentence or two… (Enter to send, Shift+Enter for line)"
                className="min-h-12 text-sm text-zinc-100 placeholder:text-zinc-500"
                disabled={status === "streaming"}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger
                    tooltip="Add context"
                    className="text-zinc-300"
                  />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments label="Add photos & files" />
                    <PromptInputActionAddScreenshot label="Take screenshot" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                <PromptInputButton
                  tooltip={{ content: "Voice input", shortcut: "Mic" }}
                  variant={listening ? "default" : "ghost"}
                  onClick={toggleSpeech}
                  className="text-zinc-300"
                >
                  <MicIcon size={16} />
                  <span className="hidden sm:inline">
                    {listening ? "Listening" : "Voice"}
                  </span>
                </PromptInputButton>

                <PromptInputButton
                  tooltip={{ content: "Web search context", shortcut: "⌘K" }}
                  variant={webSearch ? "default" : "ghost"}
                  onClick={() => setWebSearch((value) => !value)}
                  className="text-zinc-300"
                >
                  <GlobeIcon size={16} />
                  <span className="hidden sm:inline">Search</span>
                </PromptInputButton>

                <PromptInputSelect value={model} onValueChange={setModel}>
                  <PromptInputSelectTrigger className="hidden min-w-[9.5rem] sm:flex">
                    <PromptInputSelectValue />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {MODELS.map((item) => (
                      <PromptInputSelectItem key={item.id} value={item.id}>
                        {item.name}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </PromptInputTools>
              <PromptInputSubmit
                status={status === "error" ? "ready" : status}
                disabled={status === "streaming"}
              />
            </PromptInputFooter>
          </PromptInput>

          {preview && previewStep >= PREVIEW_REPLIES.length - 1 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => void finishOnboarding()}
            >
              Mark onboarding complete
            </Button>
          ) : null}

          <p className="flex items-center gap-1.5 px-1 text-[10px] text-zinc-600">
            <PaperclipIcon className="size-3" />
            Messages persist to conversations/messages
            {preview ? " (localStorage in preview)" : " (Supabase RLS)"}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 border-t border-zinc-800 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400">
            Onboarding saved — open the seeded dashboard or choose a plan.
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
              <Link href="/pricing">View pricing</Link>
            </Button>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>
        </div>
      )}

      {error ? (
        <p className="border-t border-zinc-800 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onend: (() => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
};
