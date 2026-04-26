"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SYMPTOM_OPTIONS = [
  { id: "hot_flushes", label: "Hot flushes", emoji: "🔥" },
  { id: "night_sweats", label: "Night sweats", emoji: "🌙" },
  { id: "sleep", label: "Poor sleep", emoji: "😴" },
  { id: "mood", label: "Mood changes", emoji: "💭" },
  { id: "brain_fog", label: "Brain fog", emoji: "🌫️" },
  { id: "joint_pain", label: "Joint pain", emoji: "🦵" },
  { id: "energy", label: "Low energy", emoji: "⚡" },
  { id: "anxiety", label: "Anxiety", emoji: "😰" },
];

const GOAL_OPTIONS = [
  { id: "track", label: "Log symptoms daily" },
  { id: "understand", label: "Understand my triggers" },
  { id: "doctor", label: "Prepare for GP visits" },
  { id: "hrt", label: "Monitor HRT effectiveness" },
  { id: "sleep", label: "Improve sleep quality" },
  { id: "wellbeing", label: "Overall wellbeing" },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  useEffect(() => {
    if (user?.full_name) setName(user.full_name.split(" ")[0]);
  }, [user]);

  function toggleSymptom(id: string) {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function toggleGoal(id: string) {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function finish() {
    localStorage.setItem("pause_sleep_onboarded", "true");
    router.push("/dashboard?welcome=true");
  }

  const progress = (step / 3) * 100;

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">Step {step} of 3</p>
      </div>

      {/* Step 1: Welcome */}
      {step === 1 && (
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-col items-center text-center gap-4 mb-6">
            <Image
              src="/pausesleep-logo.png"
              alt="Pause Sleep"
              width={72}
              height={72}
              className="rounded-2xl shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#1B1A44]" style={{ fontFamily: "Poppins, sans-serif" }}>
                Welcome to Pause Sleep
              </h1>
              <p className="text-gray-500 mt-1 text-sm leading-relaxed">
                Your personal menopause tracker, designed by Dr. Premila Hewage. Let&apos;s set you up in 30 seconds.
              </p>
            </div>
          </div>

          <div className="card space-y-4">
            <div>
              <label className="label">What should we call you?</label>
              <input
                type="text"
                className="input"
                placeholder="Your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="bg-primary-50 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🔒</span>
              <div>
                <p className="text-sm font-semibold text-primary-700">Your data is private</p>
                <p className="text-xs text-primary-600 mt-0.5">
                  Only you can see your health data. It&apos;s securely stored and never shared with third parties.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!name.trim()}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Main symptoms */}
      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#1B1A44]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Hi {name}! Which symptoms bother you most?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select all that apply. This helps personalise your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {SYMPTOM_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleSymptom(opt.id)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left transition-all",
                  symptoms.includes(opt.id)
                    ? "bg-primary-100 border-primary-300 text-primary-700"
                    : "bg-white border-gray-200 text-gray-700 hover:border-primary-200"
                )}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-[2] btn-primary"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Goals */}
      {step === 3 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#1B1A44]" style={{ fontFamily: "Poppins, sans-serif" }}>
              What do you want to achieve?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select your goals. We&apos;ll highlight the most relevant features for you.
            </p>
          </div>

          <div className="space-y-2.5">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleGoal(opt.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-left transition-all",
                  goals.includes(opt.id)
                    ? "bg-teal-50 border-teal-300 text-teal-800"
                    : "bg-white border-gray-200 text-gray-700 hover:border-teal-200"
                )}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                {goals.includes(opt.id) && (
                  <span className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Dr. Premila message */}
          <div className="card" style={{ background: "linear-gradient(135deg, #F0EEF8 0%, #EBF2EF 100%)", border: "1px solid rgba(27,26,68,0.08)" }}>
            <div className="flex items-start gap-3">
              <Image
                src="/pausesleep-logo.png"
                alt="Dr. Premila Hewage"
                width={40}
                height={40}
                className="rounded-full flex-shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-primary-700" style={{ fontFamily: "Poppins, sans-serif" }}>Dr. Premila Hewage, GP</p>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                  &ldquo;Tracking just 30 days of symptoms gives us data that transforms a 10-minute GP visit. I&apos;m here to help you every step of the way.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={finish}
              className="flex-[2] btn-primary"
            >
              Start Tracking ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
