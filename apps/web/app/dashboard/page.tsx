import Link from "next/link";
import { redirect } from "next/navigation";
import type { Profile, SubscriptionTier } from "@mstrmnd/shared";
import { SubscriptionPanel } from "@/components/subscription-panel";
import { isUiPreview, PREVIEW_PROFILE } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-zinc-800/90 bg-black/35 p-5 backdrop-blur-sm ${className}`}
    >
      <h2 className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function checkoutMessage(
  checkout?: string,
  tier?: string,
): string | null {
  if (checkout === "success") {
    return `Checkout complete${tier ? ` · ${tier}` : ""}. Subscription syncing via webhook.`;
  }
  if (checkout === "preview") {
    return `Preview checkout simulated for ${tier ?? "selected"} tier. Wire Stripe keys for live billing.`;
  }
  return null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const checkout = typeof params.checkout === "string" ? params.checkout : undefined;
  const tierParam = typeof params.tier === "string" ? params.tier : undefined;
  const notice = checkoutMessage(checkout, tierParam);

  let profile: Profile;

  if (isUiPreview()) {
    profile = {
      ...PREVIEW_PROFILE,
      subscription_tier:
        checkout === "preview" &&
        (tierParam === "solo" || tierParam === "pro" || tierParam === "mastermind")
          ? (tierParam as SubscriptionTier)
          : PREVIEW_PROFILE.subscription_tier,
    };
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const loaded = data as Profile | null;
    if (!loaded?.onboarding_completed) redirect("/onboarding");
    profile = loaded;
  }

  return (
    <main className="hero-atmosphere relative min-h-screen overflow-hidden">
      <div className="hero-grid absolute inset-0 opacity-35" aria-hidden />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10">
        <header className="animate-rise flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="space-y-2 sm:space-y-3">
            <Link
              href="/"
              className="text-xs font-semibold tracking-[0.34em] text-[var(--platinum)]"
            >
              MSTRMND
            </Link>
            <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-zinc-50 sm:text-5xl">
              {profile.full_name ?? "Your mastermind"}
            </h1>
            <p className="max-w-xl text-sm text-zinc-400">
              Private profile seeded. Manage subscription and review what eve learned.
            </p>
          </div>
          {isUiPreview() ? (
            <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              UI preview · mock profile
            </span>
          ) : null}
        </header>

        <div className="animate-rise-delay-1 grid gap-3 sm:gap-4 md:grid-cols-2">
          <Panel title="Memory summary" className="md:col-span-2">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {profile.memory_summary ?? "No summary yet."}
            </p>
          </Panel>

          <Panel title="Subscription">
            <SubscriptionPanel
              tier={profile.subscription_tier}
              checkoutNotice={notice}
            />
          </Panel>

          <Panel title="Signal preferences">
            <pre className="overflow-x-auto text-xs leading-relaxed text-zinc-400">
              {JSON.stringify(profile.signal_preferences ?? {}, null, 2)}
            </pre>
          </Panel>

          <Panel title="Identity">
            <pre className="overflow-x-auto text-xs leading-relaxed text-zinc-400">
              {JSON.stringify(profile.identity ?? {}, null, 2)}
            </pre>
          </Panel>

          <Panel title="Goals">
            <pre className="overflow-x-auto text-xs leading-relaxed text-zinc-400">
              {JSON.stringify(profile.goals ?? {}, null, 2)}
            </pre>
          </Panel>
        </div>
      </div>
    </main>
  );
}
