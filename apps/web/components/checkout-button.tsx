"use client";

import { useState } from "react";
import type { SubscriptionTier } from "@mstrmnd/shared";
import { Button } from "@/components/ui/button";

export function CheckoutButton({
  tier,
  label,
  className,
  variant = "default",
  size = "default",
}: {
  tier: SubscriptionTier;
  label?: string;
  className?: string;
  variant?: "default" | "secondary" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = (await response.json()) as {
        url?: string;
        error?: string;
        preview?: boolean;
      };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Unable to start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className={className}
        variant={variant}
        size={size}
        disabled={loading}
        onClick={() => void startCheckout()}
      >
        {loading ? "Redirecting…" : label ?? `Choose ${tier}`}
      </Button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
