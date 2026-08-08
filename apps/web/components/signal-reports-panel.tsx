"use client";

import { useEffect, useMemo, useState } from "react";
import type { SignalReport, SignalReportContent } from "@mstrmnd/shared";
import { Button } from "@/components/ui/button";
import {
  buildPreviewSignalReport,
  loadPreviewSignalReports,
  savePreviewSignalReports,
} from "@/lib/signal-reports";

function ListBlock({
  label,
  items,
}: {
  label: string;
  items?: string[];
}) {
  if (!items?.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <ul className="space-y-1 text-sm text-zinc-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-[var(--platinum)]">/</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SignalReportsPanel({
  initialReports,
  isPreview,
}: {
  initialReports: SignalReport[];
  isPreview: boolean;
}) {
  const [reports, setReports] = useState<SignalReport[]>(initialReports);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialReports[0]?.id ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPreview) return;
    const stored = loadPreviewSignalReports();
    setReports(stored);
    setSelectedId((current) => current ?? stored[0]?.id ?? null);
  }, [isPreview]);

  useEffect(() => {
    if (isPreview) savePreviewSignalReports(reports);
  }, [isPreview, reports]);

  const selected = useMemo(
    () => reports.find((report) => report.id === selectedId) ?? reports[0] ?? null,
    [reports, selectedId],
  );
  const content = (selected?.content ?? {}) as SignalReportContent;

  async function generate() {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/signal-reports/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ period_type: "weekly" }),
      });
      const data = (await response.json()) as {
        preview?: boolean;
        report?: SignalReport;
        sessionId?: string;
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      if (data.preview && data.report) {
        setReports((prev) => [data.report!, ...prev]);
        setSelectedId(data.report.id);
        setNotice(data.message ?? "Preview report ready.");
      } else if (isPreview) {
        const report = buildPreviewSignalReport("weekly");
        setReports((prev) => [report, ...prev]);
        setSelectedId(report.id);
        setNotice("Preview report ready.");
      } else {
        setNotice(
          data.message ??
            `Generation started${data.sessionId ? ` · session ${data.sessionId.slice(0, 8)}` : ""}. Refresh shortly.`,
        );
        // Soft refresh from server after agent write window.
        window.setTimeout(() => {
          window.location.reload();
        }, 4000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500">
          Weekly/monthly briefs from your seeded profile
          {isPreview ? " · preview" : ""}.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => void generate()}
        >
          {loading ? "Generating…" : "Generate report"}
        </Button>
      </div>

      {notice ? (
        <p className="rounded-md border border-[var(--platinum-dim)] bg-[rgba(232,226,208,0.06)] px-3 py-2 text-xs text-[var(--platinum)]">
          {notice}
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      {reports.length === 0 ? (
        <p className="text-sm text-zinc-500">No signal reports yet.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
          <ul className="space-y-1">
            {reports.map((report) => (
              <li key={report.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(report.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    selected?.id === report.id
                      ? "border-[var(--platinum-dim)] bg-[rgba(232,226,208,0.06)]"
                      : "border-zinc-800/80 bg-transparent hover:border-zinc-700"
                  }`}
                >
                  <div className="truncate text-sm text-zinc-200">
                    {report.title ?? "Untitled report"}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                    {report.period_type} · {report.status}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="space-y-4 rounded-lg border border-zinc-800/80 p-4">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-xl text-zinc-50">
                  {selected.title ?? "Untitled report"}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {selected.period_start} → {selected.period_end}
                </p>
              </div>
              {selected.summary ? (
                <p className="text-sm leading-relaxed text-zinc-300">
                  {selected.summary}
                </p>
              ) : null}
              <ListBlock label="Highlights" items={content.highlights} />
              <ListBlock label="Watchlist" items={content.watchlist} />
              <ListBlock label="Decisions" items={content.decisions} />
              <ListBlock label="Risks" items={content.risks} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
