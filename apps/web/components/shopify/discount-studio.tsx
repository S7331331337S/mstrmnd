"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { discountSchema, previewDiscount, type DiscountDraft } from "@/lib/shopify/discount";

type Bridge = { idToken: () => Promise<string>; intents?: {
  request?: { value?: unknown };
  response?: { ok: (data: { id: string }) => Promise<void>; closed: () => Promise<void> };
} };
const bridge = () => (window as unknown as { shopify?: Bridge }).shopify;
const initial = (): DiscountDraft => ({ title: "A little more. A little less.", percentage: 10,
  minimumSubtotal: 100, currencyCode: "USD", startsAt: new Date().toISOString(), endsAt: null });

export function DiscountStudio({ demo, id, clientId }: { demo: boolean; id?: string; clientId: string }) {
  const [draft, setDraft] = useState<DiscountDraft>(initial);
  const [subtotal, setSubtotal] = useState(150);
  const [ready, setReady] = useState(demo);
  const [loaded, setLoaded] = useState(demo);
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [saved, setSaved] = useState<string>();
  const [handoff, setHandoff] = useState(false);
  const [closed, setClosed] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<string[]>([demo ? "Preview opened" : "Workflow opened"]);
  const pending = useRef(false);
  const timer = useRef<number>(0);
  const activeId = id;
  const money = (amount: number) => new Intl.NumberFormat("en", { style: "currency", currency: draft.currencyCode }).format(Number.isFinite(amount) ? amount : 0);
  const result = previewDiscount(subtotal, draft);
  const log = (event: string) => setEvents((prev) => [...prev, event]);
  async function api(method: "GET" | "POST", body?: unknown) {
    const app = bridge();
    if (!app) throw new Error("Open this app in Shopify admin.");
    const token = await app.idToken();
    const response = await fetch(`/api/shopify/discounts${method === "GET" && activeId ? `?id=${encodeURIComponent(activeId)}` : ""}`, {
      method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Shopify request failed.");
    return data;
  }
  useEffect(() => { timer.current = performance.now(); }, []);
  useEffect(() => {
    if (demo || !ready) return;
    let cancelled = false;
    void api("GET").then((data) => {
      if (cancelled) return;
      setDraft(data.draft ?? { ...initial(), currencyCode: data.currencyCode });
      setLoaded(true);
    }).catch((err: Error) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
    // Load once for each authenticated page invocation, not while the merchant edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, ready, activeId]);
  function patch<K extends keyof DiscountDraft>(key: K, value: DiscountDraft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value })); setReviewing(false); setError("");
  }
  function review() {
    const parsed = discountSchema.safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setReviewing(true); log("Discount reviewed");
  }
  async function complete(savedId: string) {
    if (!demo && bridge()?.intents?.request?.value) {
      const response = bridge()?.intents?.response;
      if (!response) throw new Error("Discount saved, but Sidekick handoff is unavailable. Do not save again.");
      await response.ok({ id: savedId });
    }
    setHandoff(true); log(demo ? "Simulated Sidekick handoff" : "Workflow completed");
  }
  async function save() {
    if (!reviewing || pending.current || saved) return;
    pending.current = true; setBusy(true); setError("");
    try {
      const data = demo ? { id: "demo-discount" } : await api("POST", { draft, confirmed: true, ...(activeId ? { id: activeId } : {}) });
      // Set saved before attempting the handoff: a failed handoff must never create a duplicate discount.
      setSaved(data.id); log(`${demo ? "Preview saved" : "Discount saved"} · ${Math.round((performance.now() - timer.current) / 1000)}s`);
      await complete(data.id);
    } catch (err) { setError(err instanceof Error ? err.message : "Save failed."); }
    finally { pending.current = false; setBusy(false); }
  }
  async function cancel() {
    setError("");
    try {
      if (!demo && bridge()?.intents?.request?.value) {
        const response = bridge()?.intents?.response;
        if (!response) throw new Error("Sidekick handoff is unavailable.");
        await response.closed();
      }
      setClosed(true); log("Workflow cancelled");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not close workflow."); }
  }
  const locked = !loaded || busy || !!saved || closed;
  return <main className="min-h-screen bg-[#090909] text-zinc-100">
    {!demo && clientId && <><meta name="shopify-api-key" content={clientId} /><Script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" onReady={() => setReady(true)} onError={() => setError("Could not load Shopify App Bridge.")} /></>}
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-7">
        <Link href="/" className="text-xl font-semibold tracking-[-0.06em]">MSTRMND<span className="ml-3 text-xs font-normal tracking-[0.15em] text-zinc-500">COMMERCE</span></Link>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] uppercase tracking-[0.17em]">{demo ? "Interactive preview · no store connected" : "Shopify pilot"}</span>
      </header>
      <div className="mb-9 mt-10 flex items-center gap-2 text-xs text-zinc-500"><Sparkles size={13} /> Sidekick <ChevronRight size={12} /> <span className="text-zinc-200">Discount Studio</span></div>
      <div className="mb-10 flex items-end justify-between gap-6"><div><p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">01 / Merchant workflow</p><h1 className="text-4xl font-medium tracking-tight sm:text-5xl">Give the cart a reason.</h1><p className="mt-4 max-w-lg text-sm leading-6 text-zinc-400">A considered incentive. Set the threshold, preview the savings, and approve the discount.</p></div><ArrowUpRight className="hidden text-zinc-600 sm:block" size={40} strokeWidth={1} /></div>
      {!demo && !clientId && <p role="alert" className="mb-6 border border-zinc-600 p-4">Shopify is not configured. <a className="underline" href="?demo=1">Open interactive preview</a>.</p>}
      {error && <p role="alert" className="mb-6 border border-zinc-500 bg-zinc-900 p-4 text-sm">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="border border-zinc-800 p-6 sm:p-8">
          <div className="mb-8 flex items-center justify-between"><h2 className="text-sm font-medium">{activeId ? "Edit incentive" : "Build your incentive"}</h2><span className="text-[10px] uppercase tracking-wider text-zinc-500">Automatic / order</span></div>
          <fieldset disabled={locked} className="space-y-6 disabled:opacity-60">
            <div className="space-y-2"><Label htmlFor="title">Discount name</Label><Input id="title" value={draft.title} maxLength={80} onChange={(e) => patch("title", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="percentage">Percentage off</Label><div className="relative"><Input id="percentage" type="number" min="0.1" max="50" step="0.1" value={Number.isNaN(draft.percentage) ? "" : draft.percentage} onChange={(e) => patch("percentage", e.target.valueAsNumber)} /><span className="absolute right-3 top-2 text-zinc-500">%</span></div></div>
            <div className="space-y-2"><Label htmlFor="minimum">Minimum cart ({draft.currencyCode})</Label><Input id="minimum" type="number" min="0" step="0.01" value={Number.isNaN(draft.minimumSubtotal) ? "" : draft.minimumSubtotal} onChange={(e) => patch("minimumSubtotal", e.target.valueAsNumber)} /></div></div>
            <div className="space-y-2"><Label htmlFor="start">Starts at</Label><Input id="start" type="datetime-local" value={toLocal(draft.startsAt)} onChange={(e) => patch("startsAt", fromLocal(e.target.value))} /></div>
            <div className="space-y-2"><Label htmlFor="end">Ends at <span className="text-zinc-500">— optional</span></Label><Input id="end" type="datetime-local" value={draft.endsAt ? toLocal(draft.endsAt) : ""} onChange={(e) => patch("endsAt", e.target.value ? fromLocal(e.target.value) : null)} /><p className="text-xs text-zinc-500">Times use your device’s local timezone.</p></div>
          </fieldset>
          <div className="mt-8 flex gap-3 border-t border-zinc-800 pt-5 text-xs leading-5 text-zinc-500"><ShieldCheck size={17} className="mt-0.5 shrink-0" /><p>Up to 50% off. New discounts do not combine with other discounts. You approve every save.</p></div>
          {closed ? <p className="mt-6" role="status">Workflow cancelled. No changes saved.</p> : saved ? <div className="mt-6 space-y-3" role="status"><p className="flex items-center gap-2"><Check size={16} /> {demo ? "Preview complete — no live discount created." : "Discount saved in Shopify."}</p>{!handoff && <Button disabled={busy} onClick={() => { void complete(saved).catch((e: Error) => setError(e.message)); }}>Retry Sidekick handoff</Button>}</div> : <div className="mt-7 flex flex-wrap gap-3">
            <Button className="bg-white text-black hover:bg-zinc-200" disabled={locked} onClick={reviewing ? save : review}>{busy ? "Saving…" : reviewing ? demo ? "Confirm preview" : "Confirm and save to Shopify" : "Review discount"}</Button>
            <Button variant="ghost" disabled={busy} onClick={cancel}>Cancel</Button></div>}
          {reviewing && !saved && !closed && <p className="mt-4 text-sm leading-6 text-zinc-300" role="status">Confirm {draft.percentage}% off orders of {money(draft.minimumSubtotal)} or more, from {new Date(draft.startsAt).toLocaleString()}{draft.endsAt ? ` until ${new Date(draft.endsAt).toLocaleString()}` : " with no end date"}.</p>}
        </section>
        <aside className="space-y-6"><section className="border border-zinc-800 bg-[#101010] p-6 sm:p-8"><div className="mb-8 flex items-center justify-between"><h2 className="text-sm">Cart preview</h2><span className="text-[10px] uppercase tracking-wider text-zinc-500">Sample cart</span></div>
          <p className="text-6xl font-light tracking-tighter">{Number.isFinite(draft.percentage) ? draft.percentage : "—"}<span className="ml-1 text-3xl text-zinc-500">%</span></p><p className="mt-2 text-sm text-zinc-500">off carts over {money(draft.minimumSubtotal)}</p>
          <div className="mt-8 space-y-2"><Label htmlFor="subtotal">Try a cart subtotal</Label><Input id="subtotal" type="number" min="0" step="0.01" value={Number.isNaN(subtotal) ? "" : subtotal} onChange={(e) => setSubtotal(e.target.valueAsNumber)} /></div>
          <dl className="mt-6 space-y-4 text-sm"><div className="flex justify-between text-zinc-400"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div className="flex justify-between"><dt>Incentive {result.eligible ? "applies" : "not reached"}</dt><dd>−{money(result.savings)}</dd></div><div className="flex justify-between border-t border-zinc-700 pt-4 text-xl"><dt>After discount</dt><dd>{money(result.total)}</dd></div></dl><p className="mt-5 text-xs leading-5 text-zinc-500">Illustrative estimate before shipping and tax. Checkout currency must match this incentive. Shopify determines final rounding and eligibility.</p></section>
          <section className="border border-zinc-800 p-6"><p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-zinc-500">This session</p><ol className="space-y-3 text-xs text-zinc-400">{events.map((event, i) => <li key={i} className="flex gap-3"><span className="font-mono text-zinc-600">{String(i + 1).padStart(2, "0")}</span>{event}</li>)}</ol><p className="mt-4 text-[10px] text-zinc-600">Local session trace; no cross-merchant analytics collected.</p></section>
        </aside>
      </div><footer className="mt-10 flex justify-between border-t border-zinc-800 pt-5 text-[10px] uppercase tracking-[0.15em] text-zinc-600"><span>MSTRMND / Discount Studio</span><span>Merchant approved</span></footer>
    </div>
  </main>;
}
function toLocal(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function fromLocal(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}
