import Link from "next/link";
import { STRIPE_TIER_LIST } from "@mstrmnd/shared";
import { CheckoutButton } from "@/components/checkout-button";
import { isUiPreview } from "@/lib/preview";

export default function PricingPage() {
  return (
    <main className="hero-atmosphere relative min-h-screen overflow-hidden">
      <div className="hero-grid absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="animate-rise space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-semibold tracking-[0.34em] text-[var(--platinum)]"
            >
              MSTRMND
            </Link>
            {isUiPreview() ? (
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                UI preview · Stripe mocked
              </span>
            ) : null}
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-zinc-50 sm:text-5xl">
            Pricing
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Stripe products already exist. Checkout creates a subscription and
            writes `subscription_tier` back to your private profile.
          </p>
        </header>

        <div className="animate-rise-delay-1 grid gap-4 md:grid-cols-3">
          {STRIPE_TIER_LIST.map((tier) => (
            <section
              key={tier.id}
              className="flex flex-col rounded-2xl border border-zinc-800/90 bg-black/35 p-5 backdrop-blur-sm"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                {tier.name}
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-zinc-50">
                ${tier.priceUsd}
                <span className="ml-1 text-sm text-zinc-500">/mo</span>
              </p>
              <p className="mt-3 text-sm text-zinc-400">{tier.description}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-zinc-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-[var(--platinum)]">/</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <CheckoutButton
                  tier={tier.id}
                  label={`Start ${tier.name}`}
                  className="w-full"
                  variant={tier.id === "pro" ? "default" : "outline"}
                />
              </div>
            </section>
          ))}
        </div>

        <p className="animate-rise-delay-2 text-xs text-zinc-600">
          Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and
          `STRIPE_PRICE_SOLO|PRO|MASTERMIND` for live checkout. Preview mode
          redirects back to the dashboard with a simulated success.
        </p>
      </div>
    </main>
  );
}
