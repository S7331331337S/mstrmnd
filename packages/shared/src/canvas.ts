export type CanvasVoice = "labs" | "operator";
export type CanvasSource = "manual" | "calendar" | "trigger";
export type CanvasTouchpoint =
  | "discovery"
  | "conversion"
  | "onboarding"
  | "delivery"
  | "retention"
  | "brand";
export type CanvasFormat =
  | "press_card"
  | "linkedin"
  | "x_thread"
  | "email"
  | "site"
  | "proposal"
  | "report"
  | "visual_spec";
export type CanvasJobStatus =
  | "queued"
  | "research"
  | "drafting"
  | "gating"
  | "awaiting_approval"
  | "published"
  | "killed";
export type CanvasItemStatus = "drafted" | "indexed" | "rejected";

export interface ScoutPacket {
  thesis?: string;
  citations?: string[];
  imageBrief?: string;
  notes?: string;
}

export interface CanvasJob {
  id: string;
  user_id: string;
  source: CanvasSource;
  touchpoint: CanvasTouchpoint;
  template: CanvasFormat;
  voice: CanvasVoice;
  thesis: string;
  scout_packet: ScoutPacket;
  formats: CanvasFormat[];
  status: CanvasJobStatus;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CanvasItem {
  id: string;
  job_id: string;
  user_id: string;
  format: CanvasFormat;
  draft_cycle: number;
  body: string | null;
  content_ref: string | null;
  model_used: string | null;
  cost_usd: string | null;
  status: CanvasItemStatus;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const DEFAULT_CANVAS_FORMATS: CanvasFormat[] = ["press_card", "linkedin"];

export const TEXT_CANVAS_FORMATS: CanvasFormat[] = [
  "press_card",
  "linkedin",
  "x_thread",
  "email",
  "site",
  "proposal",
  "report",
];
