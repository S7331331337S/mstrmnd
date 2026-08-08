import Stripe from "stripe";
import type { SubscriptionTier } from "@mstrmnd/shared";
import { STRIPE_TIERS } from "@mstrmnd/shared";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  stripeClient = new Stripe(key);
  return stripeClient;
}

export function getStripePriceId(tier: SubscriptionTier): string {
  const envName = STRIPE_TIERS[tier].priceEnv;
  const priceId = process.env[envName];
  if (!priceId) {
    throw new Error(`Missing ${envName} for tier ${tier}`);
  }
  return priceId;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_SOLO &&
      process.env.STRIPE_PRICE_PRO &&
      process.env.STRIPE_PRICE_MASTERMIND,
  );
}

export function tierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const tier of Object.values(STRIPE_TIERS)) {
    const configured = process.env[tier.priceEnv];
    if (configured && configured === priceId) return tier.id;
  }
  return null;
}
