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

export const STRIPE_PRICE_AUD = 3700; // $37.00 AUD in cents

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const s = getStripe();
  const session = await s.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: 'Pause Sleep — Menopause Symptom Tracker',
            description:
              'Lifetime access to your personal menopause symptom tracker. Track symptoms, identify triggers, and generate doctor-ready reports.',
          },
          unit_amount: STRIPE_PRICE_AUD,
        },
        quantity: 1,
      },
    ],
    metadata: { userId },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });

  return session;
}
