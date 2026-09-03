import { NextResponse } from "next/server";
import type { CanvasFormat, CanvasVoice } from "@mstrmnd/shared";
import { isUiPreview } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";
import { startCanvasEveSession } from "@/lib/canvas-eve";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      template?: CanvasFormat;
      voice?: CanvasVoice;
      thesis?: string;
      formats?: CanvasFormat[];
      image_brief?: string;
    };

    const template: CanvasFormat =
      body.template === "linkedin" ? "linkedin" : "press_card";
    const voice: CanvasVoice = body.voice === "operator" ? "operator" : "labs";
    const thesis =
      body.thesis?.trim() ||
      "MSTRMND Content Engine v2 collapses 19 editorial agents into six seats. CANVAS is the creation seat.";
    const formats: CanvasFormat[] = body.formats?.length
      ? body.formats
      : ["press_card", "linkedin"];

    if (isUiPreview()) {
      const now = new Date().toISOString();
      const jobId = "00000000-0000-0000-0000-0000000000c1";
      return NextResponse.json({
        preview: true,
        job: {
          id: jobId,
          template,
          voice,
          status: "awaiting_approval",
          formats,
        },
        items: formats.map((format, index) => ({
          id: `00000000-0000-0000-0000-0000000000${10 + index}`,
          job_id: jobId,
          format,
          status: "indexed",
          body: `Preview ${format} for: ${thesis}`,
          created_at: now,
        })),
        message:
          "Preview CANVAS job generated locally (canvas eve not called). CIPHER / HERALD are not wired.",
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.onboarding_completed) {
      return NextResponse.json(
        { error: "Complete onboarding before starting a CANVAS job" },
        { status: 400 },
      );
    }

    const lines = [
      `Run a CANVAS job.`,
      `template=${template}`,
      `voice=${voice}`,
      `thesis=${thesis}`,
      `formats=${formats.join(",")}`,
    ];
    if (body.image_brief) {
      lines.push(`image_brief=${body.image_brief}`);
    }
    lines.push(
      "Start the job, draft every planned format, index each item, mark the job awaiting_approval. Do not publish.",
    );

    const started = await startCanvasEveSession(lines.join("\n"), accessToken);

    if (!started.sessionId) {
      return NextResponse.json(
        { error: "canvas agent did not return a session id" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      sessionId: started.sessionId,
      template,
      voice,
      message: "CANVAS job started via eve. Drafts will land in ce_items.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to start CANVAS job",
      },
      { status: 500 },
    );
  }
}
