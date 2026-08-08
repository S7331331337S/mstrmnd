import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-between px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="text-sm font-semibold tracking-[0.28em] text-zinc-100">
          MSTRMND
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="max-w-2xl space-y-6 py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
          Intelligence layer
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          Mstrmnd
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
          A user-owned agentic intelligence layer. Conversational onboarding seeds
          a private profile, then powers your personal/business mastermind and
          weekly or monthly signal reports.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg">
            <Link href="/signup">Start onboarding</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-zinc-900 pt-6 text-xs text-zinc-600">
        Solo $49 · Pro $149 · Mastermind $349 — Stripe products wired next.
      </footer>
    </main>
  );
}
