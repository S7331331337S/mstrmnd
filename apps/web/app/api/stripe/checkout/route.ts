import { NextResponse } from "next/server";
import type { SubscriptionTier } from "@mstrmnd/shared";
import { STRIPE_TIERS } from "@mstrmnd/shared";
import { isUiPreview } from "@/lib/preview";
import { getStripe, getStripePriceId, isStripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const TIERS = new Set<SubscriptionTier>(["solo", "pro", "mastermind"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { tier?: string };
    const tier = body.tier as SubscriptionTier | undefined;

    if (!tier || !TIERS.has(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

    if (isUiPreview() || !isStripeConfigured()) {
      return NextResponse.json({
        preview: true,
        url: `${siteUrl}/dashboard?checkout=preview&tier=${tier}`,
        tier,
        product: STRIPE_TIERS[tier].name,
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .maybeSingle();

    const stripe = getStripe();
    let customerId = profile?.stripe_customer_id ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email ?? undefined,
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: getStripePriceId(tier), quantity: 1 }],
      success_url: `${siteUrl}/dashboard?checkout=success&tier=${tier}`,
      cancel_url: `${siteUrl}/pricing?checkout=cancel`,
      metadata: {
        supabase_user_id: user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier,
        },
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Checkout failed",
      },
      { status: 500 },
    );
  }
}
