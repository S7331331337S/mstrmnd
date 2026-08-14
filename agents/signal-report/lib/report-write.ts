import type {
  Profile,
  SignalPeriodType,
  SignalReport,
  SignalReportContent,
  SignalReportStatus,
} from "@mstrmnd/shared";
import { defaultPeriodWindow } from "./period";
import { getServiceSupabase } from "./supabase";

export async function loadUserProfile(userId: string): Promise<Profile> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }
  if (!data) {
    throw new Error("Profile not found for authenticated user");
  }

  return data as Profile;
}

export async function startSignalReport(params: {
  userId: string;
  periodType: SignalPeriodType;
  periodStart?: string;
  periodEnd?: string;
}): Promise<SignalReport> {
  const supabase = getServiceSupabase();
  const window =
    params.periodStart && params.periodEnd
      ? { period_start: params.periodStart, period_end: params.periodEnd }
      : defaultPeriodWindow(params.periodType);

  const { data, error } = await supabase
    .from("signal_reports")
    .insert({
      user_id: params.userId,
      period_type: params.periodType,
      period_start: window.period_start,
      period_end: window.period_end,
      status: "generating" as SignalReportStatus,
      content: {},
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to start signal report: ${error?.message}`);
  }

  return data as SignalReport;
}

export async function writeSignalReport(params: {
  userId: string;
  reportId: string;
  title: string;
  summary: string;
  content: SignalReportContent;
}): Promise<SignalReport> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("signal_reports")
    .update({
      title: params.title,
      summary: params.summary,
      content: params.content,
      status: "ready" as SignalReportStatus,
      generated_at: new Date().toISOString(),
    })
    .eq("id", params.reportId)
    .eq("user_id", params.userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to write signal report: ${error?.message}`);
  }

  return data as SignalReport;
}

export async function failSignalReport(params: {
  userId: string;
  reportId: string;
  reason: string;
}): Promise<SignalReport> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("signal_reports")
    .update({
      status: "failed" as SignalReportStatus,
      summary: params.reason,
      generated_at: new Date().toISOString(),
    })
    .eq("id", params.reportId)
    .eq("user_id", params.userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to mark signal report failed: ${error?.message}`);
  }

  return data as SignalReport;
}
