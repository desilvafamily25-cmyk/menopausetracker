import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string,
  couponCode?: string
) {
  const s = getStripe();

  const discountOptions = couponCode
    ? { discounts: [{ coupon: couponCode }] }
    : { allow_promotion_codes: true };

  const session = await s.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    metadata: { userId },
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: 'auto',
    ...discountOptions,
  });

  return session;
}
