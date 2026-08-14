"use client";

import Link from "next/link";
import type { SubscriptionTier } from "@mstrmnd/shared";
import { STRIPE_TIERS } from "@mstrmnd/shared";
import { CheckoutButton } from "@/components/checkout-button";
import { Button } from "@/components/ui/button";

export function SubscriptionPanel({
  tier,
  checkoutNotice,
}: {
  tier: SubscriptionTier | null;
  checkoutNotice?: string | null;
}) {
  const current = tier ? STRIPE_TIERS[tier] : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-zinc-200">
          {current ? `${current.name} · $${current.priceUsd}/mo` : "Not selected"}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Solo $49 · Pro $149 · Mastermind $349
        </p>
        {checkoutNotice ? (
          <p className="mt-3 rounded-md border border-[var(--platinum-dim)] bg-[rgba(232,226,208,0.06)] px-3 py-2 text-xs text-[var(--platinum)]">
            {checkoutNotice}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <CheckoutButton tier="solo" label="Solo" size="sm" variant="outline" />
        <CheckoutButton tier="pro" label="Pro" size="sm" />
        <CheckoutButton
          tier="mastermind"
          label="Mastermind"
          size="sm"
          variant="outline"
        />
        <Button asChild size="sm" variant="ghost">
          <Link href="/pricing">Compare plans</Link>
        </Button>
      </div>
    </div>
  );
}
