import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const sessionId = url.searchParams.get("session_id");

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      const userId = session.metadata?.userId;

      // Mark paid if: actual payment succeeded OR 100% coupon made it free
      const isPaid =
        session.payment_status === "paid" ||
        (session.payment_status === "no_payment_required" && session.status === "complete") ||
        session.amount_total === 0;

      if (userId && isPaid) {
        await getSupabaseAdmin()
          .from("users")
          .update({
            has_paid: true,
            subscription_status: "paid",
            stripe_customer_id: session.customer as string | null,
            stripe_payment_intent_id: (session.payment_intent as string) ?? null,
            paid_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    } catch (err) {
      console.error("Stripe success handler error:", err);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard?welcome=true`);
}
