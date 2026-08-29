import {
  DEFAULT_CANVAS_FORMATS,
  TEXT_CANVAS_FORMATS,
  type CanvasFormat,
  type CanvasJob,
} from "@mstrmnd/shared";

export type CanvasToolName = "draft_text_format" | "draft_visual_spec";

export interface PlanStep {
  id: string;
  format: CanvasFormat;
  tool: CanvasToolName;
}

export interface CanvasPlan {
  jobId: string;
  /** Independent formats share a level and should be drafted together. */
  levels: PlanStep[][];
}

function toolFor(format: CanvasFormat): CanvasToolName {
  return format === "visual_spec" ? "draft_visual_spec" : "draft_text_format";
}

/**
 * Studio cluster fan-out: independent formats run as one level.
 * visual_spec is omitted when the SCOUT packet has no image brief.
 */
export function planCanvasJob(job: CanvasJob): CanvasPlan {
  const formats = job.formats.length > 0 ? job.formats : DEFAULT_CANVAS_FORMATS;
  const hasImageBrief = Boolean(job.scout_packet.imageBrief?.trim());
  const text = new Set<CanvasFormat>(TEXT_CANVAS_FORMATS);

  const steps: PlanStep[] = formats
    .filter((format) => {
      if (format === "visual_spec") return hasImageBrief;
      return text.has(format);
    })
    .map((format) => ({
      id: format,
      format,
      tool: toolFor(format),
    }));

  if (steps.length === 0) {
    throw new Error("CANVAS job has no executable formats");
  }

  return { jobId: job.id, levels: [steps] };
}
