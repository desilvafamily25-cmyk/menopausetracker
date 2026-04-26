import { NextResponse } from "next/server";

// Redirect after successful Stripe checkout (handles the {CHECKOUT_SESSION_ID} replacement)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  return NextResponse.redirect(`${origin}/dashboard?welcome=true`);
}
