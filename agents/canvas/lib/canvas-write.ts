import type {
  CanvasFormat,
  CanvasItem,
  CanvasItemStatus,
  CanvasJob,
  CanvasSource,
  CanvasTouchpoint,
  CanvasVoice,
  ScoutPacket,
} from "@mstrmnd/shared";
import { DEFAULT_CANVAS_FORMATS } from "@mstrmnd/shared";
import { computeCanvasPlanSteps, planCanvasJob, type CanvasPlan } from "./fanout";
import { loadVoiceBible } from "./canon";
import { getServiceSupabase } from "./supabase";
import { assertVoice } from "./voice";

export async function startCanvasJob(params: {
  userId: string;
  source?: CanvasSource;
  touchpoint?: CanvasTouchpoint;
  template: CanvasFormat;
  voice: CanvasVoice;
  thesis: string;
  scoutPacket?: ScoutPacket;
  formats?: CanvasFormat[];
  priority?: number;
}): Promise<{ job: CanvasJob; plan: CanvasPlan; bible: string }> {
  const supabase = getServiceSupabase();
  const formats = params.formats?.length ? params.formats : DEFAULT_CANVAS_FORMATS;

  // Validate that the requested formats resolve to an executable plan BEFORE
  // inserting the ce_jobs row, so invalid input does not leave an orphaned
  // "drafting" job persisted with no items and no way to progress.
  computeCanvasPlanSteps({ formats, scoutPacket: params.scoutPacket ?? {} });

  const { data, error } = await supabase
    .from("ce_jobs")
    .insert({
      user_id: params.userId,
      source: params.source ?? "manual",
      touchpoint: params.touchpoint ?? "brand",
      template: params.template,
      voice: params.voice,
      thesis: params.thesis,
      scout_packet: params.scoutPacket ?? {},
      formats,
      status: "drafting",
      priority: params.priority ?? 3,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to start CANVAS job: ${error?.message}`);
  }

  const job = data as CanvasJob;
  return {
    job,
    plan: planCanvasJob(job),
    bible: loadVoiceBible(job.voice),
  };
}

export async function loadCanvasJob(params: {
  userId: string;
  jobId: string;
}): Promise<CanvasJob> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("ce_jobs")
    .select("*")
    .eq("id", params.jobId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load CANVAS job: ${error.message}`);
  }
  if (!data) {
    throw new Error("CANVAS job not found for authenticated user");
  }
  return data as CanvasJob;
}

export async function insertCanvasItem(params: {
  userId: string;
  job: CanvasJob;
  format: CanvasFormat;
  body: string;
  modelUsed: string;
  metadata?: Record<string, unknown>;
}): Promise<CanvasItem> {
  assertVoice(params.job.voice, params.body);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("ce_items")
    .insert({
      job_id: params.job.id,
      user_id: params.userId,
      format: params.format,
      draft_cycle: 1,
      body: params.body,
      model_used: params.modelUsed,
      status: "drafted" as CanvasItemStatus,
      metadata: params.metadata ?? {},
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to insert CANVAS item: ${error?.message}`);
  }

  const id = (data as CanvasItem).id;
  const { data: updated, error: updateError } = await supabase
    .from("ce_items")
    .update({ content_ref: `ce_items/${id}` })
    .eq("id", id)
    .eq("user_id", params.userId)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to set content_ref: ${updateError?.message}`);
  }
  return updated as CanvasItem;
}

export async function indexCanvasItem(params: {
  userId: string;
  itemId: string;
}): Promise<CanvasItem> {
  const supabase = getServiceSupabase();
  const { data: existing, error: loadError } = await supabase
    .from("ce_items")
    .select("*")
    .eq("id", params.itemId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (loadError) {
    throw new Error(`Failed to load CANVAS item: ${loadError.message}`);
  }
  if (!existing) {
    throw new Error("CANVAS item not found for authenticated user");
  }

  const item = existing as CanvasItem;
  const metadata = {
    ...item.metadata,
    indexedAt: new Date().toISOString(),
    tags: ["canvas-output", `job:${item.job_id}`, `format:${item.format}`],
  };

  const { data, error } = await supabase
    .from("ce_items")
    .update({
      status: "indexed" as CanvasItemStatus,
      metadata,
    })
    .eq("id", params.itemId)
    .eq("user_id", params.userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to index CANVAS item: ${error?.message}`);
  }
  return data as CanvasItem;
}

export async function markJobAwaitingApproval(params: {
  userId: string;
  jobId: string;
}): Promise<CanvasJob> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("ce_jobs")
    .update({ status: "awaiting_approval" })
    .eq("id", params.jobId)
    .eq("user_id", params.userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to mark CANVAS job awaiting approval: ${error?.message}`);
  }
  return data as CanvasJob;
}
