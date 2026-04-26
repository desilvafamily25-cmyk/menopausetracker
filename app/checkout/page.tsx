"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Shield, Star } from "lucide-react";
import Button from "@/components/ui/Button";

const included = [
  "Unlimited daily symptom logging",
  "Automatic trigger identification",
  "Professional doctor reports (PDF)",
  "Treatment & supplement tracker",
  "Before/after treatment charts",
  "Lifetime access — no subscription",
  "Data export & privacy controls",
];

function CheckoutContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled");

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/pausesleep-logo.png"
              alt="Pause Sleep"
              width={52}
              height={52}
              className="rounded-full"
            />
            <span className="font-bold text-xl text-[#1B1A44]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Pause Sleep
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1B1A44] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            Unlock Your Tracker
          </h1>
          <p className="text-gray-500">One payment. Lifetime access.</p>
        </div>

        {cancelled && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-amber-700 text-sm">Payment was cancelled. No charge was made.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* What's included */}
          <div className="card">
            <h2 className="text-lg font-semibold text-[#1B1A44] mb-5">What&apos;s included</h2>
            <ul className="space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-500 italic">
                &ldquo;Best $37 I&apos;ve spent. My GP was amazed at the data.&rdquo;
              </p>
              <p className="text-xs text-gray-400 mt-1">— Sarah, 52</p>
            </div>
          </div>

          {/* Payment card */}
          <div className="card flex flex-col">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-[#1B1A44] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                $37
              </div>
              <p className="text-gray-400 text-sm">AUD · One-time payment</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              onClick={handleCheckout}
              loading={loading}
              fullWidth
              size="lg"
              className="mb-4"
            >
              Pay $37 AUD — Get Access
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
              <Shield className="w-3.5 h-3.5" />
              Secure payment via Stripe. We never see your card details.
            </div>

            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-primary-700">30-day money-back guarantee</p>
              <p className="text-xs text-primary-500 mt-1">
                Not happy? Email us for a full refund, no questions asked.
              </p>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Created by Dr. Premila Hewage, GP — designed from real clinical experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
