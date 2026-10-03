type State = "live" | "built" | "next";

const SYSTEMS: { name: string; plain: string; state: State }[] = [
  { name: "Onboarding agent", plain: "Interviews you, builds your private profile", state: "built" },
  { name: "Signal reports", plain: "Weekly / monthly briefings from your profile", state: "built" },
  { name: "CANVAS", plain: "Drafts content in multiple formats", state: "built" },
  { name: "Auth + database", plain: "Supabase, every row locked to its owner", state: "built" },
  { name: "Billing", plain: "Stripe Solo / Pro / Mastermind", state: "built" },
  { name: "Vision / multimodal context", plain: "Not part of this phase yet", state: "next" },
  { name: "CIPHER gate + Slack one-tap", plain: "Next up", state: "next" },
];

const LABEL: Record<State, string> = {
  live: "Live",
  built: "Built",
  next: "Queued",
};

export function OperatorStatus() {
  return (
    <aside
      aria-label="Operator status"
      className="animate-rise-delay-3 mt-10 w-full max-w-md border border-zinc-800 bg-black/40 p-4 backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        <span>Operator status</span>
        <span>Phase 1 · Foundation</span>
      </div>
      <ul className="divide-y divide-zinc-900">
        {SYSTEMS.map((s) => (
          <li key={s.name} className="flex items-start justify-between gap-3 py-2">
            <div>
              <p className="text-sm text-zinc-100">{s.name}</p>
              <p className="text-xs text-zinc-500">{s.plain}</p>
            </div>
            <span
              className={`mt-0.5 shrink-0 border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                s.state === "next"
                  ? "border-zinc-800 text-zinc-600"
                  : "border-zinc-500 text-[var(--platinum)]"
              }`}
            >
              {LABEL[s.state]}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
