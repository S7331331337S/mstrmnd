import Link from "next/link";
import { OnboardingChat } from "@/components/onboarding-chat";
import { isUiPreview } from "@/lib/preview";

export default function OnboardingPage() {
  return (
    <main className="hero-atmosphere relative min-h-screen overflow-hidden">
      <div className="hero-grid absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10">
        <header className="animate-rise space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-semibold tracking-[0.34em] text-[var(--platinum)]"
            >
              MSTRMND
            </Link>
            {isUiPreview() ? (
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                UI preview
              </span>
            ) : null}
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-zinc-50 sm:text-5xl">
            Intelligence gathering
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Talk with eve. Attach notes, capture screenshots, or use voice —
            it seeds your private profile, then unlocks the dashboard.
          </p>
        </header>
        <div className="animate-rise-delay-1 min-h-0 flex-1">
          <OnboardingChat />
        </div>
      </div>
    </main>
  );
}
