import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isUiPreview } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  if (!isUiPreview()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      redirect(profile?.onboarding_completed ? "/dashboard" : "/onboarding");
    }
  }

  return (
    <main className="hero-atmosphere hero-grain relative min-h-screen overflow-hidden">
      <div className="hero-grid absolute inset-0" aria-hidden />
      <div
        className="scan-line pointer-events-none absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-[var(--platinum)] to-transparent opacity-40"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-10 sm:py-8">
        <header className="animate-rise flex items-center justify-between gap-3">
          <div className="text-xs font-semibold tracking-[0.34em] text-[var(--platinum)]">
            MSTRMND
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isUiPreview() ? (
              <span className="mr-1 hidden text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:inline">
                UI preview
              </span>
            ) : null}
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-14 sm:py-24">
          <p className="animate-rise-delay-1 mb-4 max-w-xl font-[family-name:var(--font-display)] text-[2.75rem] leading-[0.95] tracking-tight text-[var(--platinum)] sm:mb-5 sm:text-7xl md:text-8xl">
            Mstrmnd
          </p>
          <h1 className="animate-rise-delay-2 max-w-2xl text-lg font-medium leading-snug tracking-tight text-zinc-100 sm:text-2xl">
            The intelligence layer between vision and daily execution.
          </h1>
          <p className="animate-rise-delay-2 mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:mt-4 sm:text-lg">
            Seed a private profile through conversation. Then run a personal
            mastermind with weekly and monthly signal reports that stay relevant.
          </p>
          <div className="animate-rise-delay-3 mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={isUiPreview() ? "/onboarding" : "/signup"}>
                Start onboarding
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href={isUiPreview() ? "/dashboard" : "/login"}>
                {isUiPreview() ? "View dashboard" : "I already have an account"}
              </Link>
            </Button>
          </div>
        </section>

        <footer className="animate-rise-delay-3 border-t border-zinc-900/80 pt-5 text-[10px] uppercase tracking-[0.14em] text-zinc-600 sm:text-[11px] sm:tracking-[0.16em]">
          Solo $49 · Pro $149 · Mastermind $349
        </footer>
      </div>
    </main>
  );
}
