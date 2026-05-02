"use client";

import { useState } from "react";
import { useLogs } from "@/hooks/useLogs";
import { today } from "@/lib/utils";
import { CheckCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const MOODS = [
  { value: "great",    emoji: "😄", label: "Great" },
  { value: "good",     emoji: "🙂", label: "Good" },
  { value: "okay",     emoji: "😐", label: "Okay" },
  { value: "poor",     emoji: "😞", label: "Poor" },
  { value: "terrible", emoji: "😢", label: "Hard" },
] as const;

export default function QuickLog({ onSaved }: { onSaved?: () => void }) {
  const { saveLog, getLogForDate } = useLogs();
  const [flushes, setFlushes]   = useState(0);
  const [sleep, setSleep]       = useState<number | null>(null);
  const [mood, setMood]         = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const existingLog = getLogForDate(today());
  if (existingLog) return null; // hide if already logged today

  async function handleSave() {
    if (mood === null && sleep === null) return;
    setSaving(true);
    try {
      await saveLog({
        log_date: today(),
        hot_flushes_count: flushes,
        night_sweats_count: 0,
        sleep_quality: sleep,
        sleep_hours: null,
        mood: mood as "great" | "good" | "okay" | "poor" | "terrible" | null,
        energy_level: null,
        brain_fog: false,
        joint_pain_level: 0,
        period_today: false,
        alcohol_consumed: false,
        caffeine_after_2pm: false,
        spicy_food: false,
        high_stress: false,
        exercise: null,
        notes: null,
      });
      setSaved(true);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="card flex items-center gap-3 bg-teal-50 border-teal-200">
        <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
        <p className="text-sm font-semibold text-teal-800">Today logged! <span className="font-normal text-teal-700">Add more detail anytime in Daily Log.</span></p>
      </div>
    );
  }

  return (
    <div className="card" style={{ background: "linear-gradient(135deg, #FCEFEA 0%, #F3F7F4 100%)", border: "1px solid rgba(59,36,28,0.08)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#3B241C]" style={{ fontFamily: "Cormorant Garamond, sans-serif" }}>Quick Log Today</p>
          <p className="text-xs text-gray-600">30 seconds · 3 taps</p>
        </div>
      </div>

      {/* Hot flushes */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">Hot flushes today</p>
        <div className="flex gap-1.5 flex-wrap">
          {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setFlushes(n)}
              className={cn(
                "w-9 h-9 rounded-xl text-sm font-bold transition-all",
                flushes === n
                  ? "bg-coral-400 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-coral-300"
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFlushes(11)}
            className={cn(
              "px-3 h-9 rounded-xl text-sm font-bold transition-all",
              flushes > 10
                ? "bg-coral-400 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:border-coral-300"
            )}
          >
            10+
          </button>
        </div>
      </div>

      {/* Sleep quality */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">Sleep last night</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSleep(s * 2)}
              className="text-2xl transition-transform active:scale-110"
              style={{ filter: sleep !== null && s * 2 <= sleep ? "none" : "grayscale(1) opacity(0.4)" }}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-700 mb-2">How do you feel?</p>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl border transition-all",
                mood === m.value
                  ? "bg-primary-100 border-primary-300"
                  : "bg-white border-gray-200 hover:border-primary-200"
              )}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[9px] font-semibold text-gray-600">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || (mood === null && sleep === null)}
        className="btn-primary w-full text-sm"
      >
        {saving ? "Saving…" : "Save — 30 sec log ✓"}
      </button>
    </div>
  );
}
