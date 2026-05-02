import Link from "next/link";
import Image from "next/image";
import { BarChart2, FileText, Pill, CheckCircle, ArrowRight, Star } from "lucide-react";
import Footer from "@/components/layout/Footer";

const features = [
  {
    icon: BarChart2,
    title: "Track Every Symptom",
    desc: "Log hot flushes, night sweats, sleep quality, mood, energy, and more — all in one place.",
  },
  {
    icon: CheckCircle,
    title: "Identify Your Triggers",
    desc: "Discover how alcohol, caffeine, stress, and diet impact your symptoms with automatic correlation analysis.",
  },
  {
    icon: FileText,
    title: "Doctor-Ready Reports",
    desc: "Generate professional PDF reports in seconds. Walk into appointments prepared, not flustered.",
  },
  {
    icon: Pill,
    title: "Treatment Tracker",
    desc: "Monitor HRT, supplements, and lifestyle changes. See exactly what's working with before/after charts.",
  },
];

const testimonials = [
  {
    quote: "Finally I could show my GP exactly what was happening. She adjusted my HRT dose immediately.",
    author: "Sarah M., 52",
  },
  {
    quote: "I discovered coffee after 2pm was causing my worst nights. Such a simple fix I'd never have noticed without the data.",
    author: "Jenny K., 49",
  },
  {
    quote: "The doctor report saved so much time. My specialist said it was the most useful patient summary she'd seen.",
    author: "Christine T., 55",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FBF4EC]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/pausesleep-logo.png"
              alt="Pause Sleep"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-semibold text-[#3B241C]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
              Pause Sleep
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary text-sm px-4 py-2">
              Get Started — $37
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-teal-50 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-primary-100 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Created by Dr. Premila Hewage, GP
          </span>
          <h1
            className="text-4xl md:text-6xl font-bold text-[#3B241C] mb-6 leading-tight"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Take Control of Your{" "}
            <span className="bg-gradient-to-r from-primary-500 to-teal-500 bg-clip-text text-transparent">
              Menopause Journey
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track symptoms daily, discover what triggers your worst days, and generate
            professional reports that actually help your GP help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-600 transition-all shadow-lg shadow-primary-200"
            >
              Start Tracking — $37 AUD
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 border border-primary-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all"
            >
              I already have an account
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">One-time payment. Lifetime access. No subscriptions.</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl font-bold text-[#3B241C] mb-3"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Everything you need in one place
            </h2>
            <p className="text-gray-500">
              Designed by a GP who understands what matters to you and your doctor.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover group">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="font-semibold text-[#3B241C] mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you track */}
      <section className="px-4 py-20 bg-gradient-to-br from-primary-50 to-teal-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold text-[#3B241C] mb-3"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              What you&apos;ll track
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Hot flushes (count per day)",
              "Night sweats",
              "Sleep quality & hours",
              "Mood & energy levels",
              "Brain fog",
              "Joint pain",
              "Alcohol & caffeine",
              "Stress levels",
              "Exercise",
              "Period tracking",
              "Spicy food intake",
              "Personal notes",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold text-[#3B241C] mb-3"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              What patients say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, author }) => (
              <div key={author} className="card">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
                <p className="text-xs font-medium text-gray-400">{author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 bg-primary-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Start your 30-day story today
          </h2>
          <p className="text-primary-100 mb-8">
            30 days of data is all your GP needs to make better decisions about your care.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all shadow-xl"
          >
            Get lifetime access — $37 AUD
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-primary-200 text-sm mt-4">Secure payment via Stripe. 30-day money-back guarantee.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
