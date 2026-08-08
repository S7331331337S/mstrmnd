import { NextResponse } from "next/server";
import type { SignalPeriodType } from "@mstrmnd/shared";
import { isUiPreview } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";
import { startSignalEveSession } from "@/lib/signal-eve";
import { buildPreviewSignalReport } from "@/lib/signal-reports";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      period_type?: SignalPeriodType;
    };
    const periodType: SignalPeriodType =
      body.period_type === "monthly" ? "monthly" : "weekly";

    if (isUiPreview()) {
      const report = buildPreviewSignalReport(periodType);
      return NextResponse.json({
        preview: true,
        report,
        message: "Preview report generated locally (signal-report eve not called).",
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
      .select("onboarding_completed, signal_preferences")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.onboarding_completed) {
      return NextResponse.json(
        { error: "Complete onboarding before generating signal reports" },
        { status: 400 },
      );
    }

    const cadence =
      (profile.signal_preferences as { cadence?: SignalPeriodType } | null)
        ?.cadence === "monthly"
        ? "monthly"
        : periodType;

    const started = await startSignalEveSession(
      `Generate a ${cadence} signal report for me now. Load my profile, start the report, write the finished brief with highlights/watchlist/decisions, then confirm.`,
      accessToken,
    );

    if (!started.sessionId) {
      return NextResponse.json(
        { error: "signal-report agent did not return a session id" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      sessionId: started.sessionId,
      period_type: cadence,
      message: "Signal report generation started via eve.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate signal report",
      },
      { status: 500 },
    );
  }
}
