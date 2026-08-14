import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripe, tierFromPriceId } from "@/lib/stripe";

export const runtime = "nodejs";

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase service role credentials for Stripe webhook");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function applySubscription(
  userId: string,
  subscription: Stripe.Subscription,
) {
  const priceId = subscription.items.data[0]?.price?.id;
  const tier =
    (subscription.metadata.tier as "solo" | "pro" | "mastermind" | undefined) ??
    (priceId ? tierFromPriceId(priceId) : null);

  const supabase = getServiceSupabase();
  await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      stripe_customer_id:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      stripe_subscription_id: subscription.id,
    })
    .eq("id", userId);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook signature/secret" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid webhook signature",
      },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            String(session.subscription),
          );
          await applySubscription(userId, subscription);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId) await applySubscription(userId, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId) {
          const supabase = getServiceSupabase();
          await supabase
            .from("profiles")
            .update({
              subscription_tier: null,
              stripe_subscription_id: null,
            })
            .eq("id", userId);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook handler failed",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
