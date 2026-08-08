import { redirect } from "next/navigation";
import type { Profile } from "@mstrmnd/shared";
import { STRIPE_TIERS } from "@mstrmnd/shared";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
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

  const profile = data as Profile | null;
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const tier = profile.subscription_tier
    ? STRIPE_TIERS[profile.subscription_tier]
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.24em] text-zinc-500">MSTRMND · DASHBOARD</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          {profile.full_name ?? "Your mastermind"}
        </h1>
        <p className="text-sm text-zinc-400">
          Private profile seeded. Signal reports and deeper agents come next.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Memory summary</CardTitle>
            <CardDescription>Written by eve at onboarding completion.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {profile.memory_summary ?? "No summary yet."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Stripe gating placeholder for Phase 1.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            <p>
              Tier:{" "}
              <span className="text-zinc-100">
                {tier ? `${tier.name} ($${tier.priceUsd}/mo)` : "Not selected"}
              </span>
            </p>
            <p className="text-zinc-500">
              Products exist: Solo $49 / Pro $149 / Mastermind $349. Checkout
              wiring is next.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto text-xs text-zinc-400">
              {JSON.stringify(profile.identity ?? {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto text-xs text-zinc-400">
              {JSON.stringify(profile.goals ?? {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
