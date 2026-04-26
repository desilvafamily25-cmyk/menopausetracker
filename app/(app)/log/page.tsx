"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, subDays, parseISO } from "date-fns";
import { useLogs } from "@/hooks/useLogs";
import { today } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card, { CardTitle } from "@/components/ui/Card";
import { CheckCircle, ChevronLeft, ChevronRight, Flame, Moon, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const MOOD_OPTIONS = [
  { value: "great", label: "Great 😄", color: "bg-teal-100 text-teal-700 border-teal-300" },
  { value: "good", label: "Good 🙂", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "okay", label: "Okay 😐", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "poor", label: "Poor 😞", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { value: "terrible", label: "Terrible 😢", color: "bg-red-100 text-red-700 border-red-300" },
];

const EXERCISE_OPTIONS = ["None", "Walk", "Swim", "Yoga", "Gym", "Run", "Cycle", "Other"];

const DRAFT_KEY = "pause_sleep_log_draft";

const schema = z.object({
  log_date: z.string(),
  hot_flushes_count: z.number().min(0).max(50),
  night_sweats_count: z.number().min(0).max(20),
  sleep_quality: z.number().min(1).max(10).nullable(),
  sleep_hours: z.number().min(0).max(12).nullable(),
  mood: z.enum(["great", "good", "okay", "poor", "terrible"]).nullable(),
  energy_level: z.number().min(1).max(10).nullable(),
  brain_fog: z.boolean(),
  joint_pain_level: z.number().min(0).max(10),
  period_today: z.boolean(),
  alcohol_consumed: z.boolean(),
  caffeine_after_2pm: z.boolean(),
  spicy_food: z.boolean(),
  high_stress: z.boolean(),
  exercise: z.string().nullable(),
  notes: z.string().nullable(),
});

type FormData = z.infer<typeof schema>;

function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
  icon: Icon,
  color = "purple",
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  icon?: React.ElementType;
  color?: "purple" | "teal" | "coral";
}) {
  const colors = {
    purple: "accent-primary-500",
    teal: "accent-teal-500",
    coral: "accent-coral-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label flex items-center gap-1.5 mb-0">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </label>
        <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-full bg-gray-200 appearance-none cursor-pointer ${colors[color]}`}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function ToggleChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150",
        checked
          ? "bg-primary-100 text-primary-700 border-primary-300"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
      )}
    >
      {checked ? "✓ " : ""}{label}
    </button>
  );
}

const defaultValues: FormData = {
  log_date: today(),
  hot_flushes_count: 0,
  night_sweats_count: 0,
  sleep_quality: 7,
  sleep_hours: 7,
  mood: null,
  energy_level: 5,
  brain_fog: false,
  joint_pain_level: 0,
  period_today: false,
  alcohol_consumed: false,
  caffeine_after_2pm: false,
  spicy_food: false,
  high_stress: false,
  exercise: null,
  notes: null,
};

export default function LogPage() {
  const { logs, saveLog, getLogForDate } = useLogs();
  const [currentDate, setCurrentDate] = useState(today());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const watchedValues = watch();

  // Load log for selected date
  const loadDate = useCallback(
    (date: string) => {
      const existing = getLogForDate(date);
      if (existing) {
        reset({ ...existing, log_date: date });
      } else {
        reset({ ...defaultValues, log_date: date });
      }
      setSaved(false);
    },
    [getLogForDate, reset]
  );

  useEffect(() => {
    loadDate(currentDate);
  }, [currentDate, logs, loadDate]);

  // Auto-save draft to localStorage every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...watchedValues, draft_date: currentDate }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, watchedValues, currentDate]);

  async function onSubmit(data: FormData) {
    setSaving(true);
    setSaveError("");
    try {
      await saveLog(data);
      setSaved(true);
      localStorage.removeItem(DRAFT_KEY);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const isToday = currentDate === today();
  const existingLog = getLogForDate(currentDate);

  const isHardDay =
    watchedValues.hot_flushes_count >= 8 ||
    watchedValues.mood === "terrible" ||
    watchedValues.mood === "poor";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Date nav */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Daily Log</h1>
          <p className="page-sub">Record how you&apos;re feeling today</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setCurrentDate(format(subDays(parseISO(currentDate), 1), "yyyy-MM-dd"))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="text-center px-2">
            <p className="text-sm font-semibold text-[#1B1A44]">
              {format(parseISO(currentDate), "d MMM yyyy")}
            </p>
            {isToday && <p className="text-xs text-primary-500">Today</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              const next = format(addDays(parseISO(currentDate), 1), "yyyy-MM-dd");
              if (next <= today()) setCurrentDate(next);
            }}
            disabled={currentDate >= today()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {existingLog && !isDirty && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-teal-600" />
          <p className="text-sm text-teal-700">Log exists for this date. Edit and save to update.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Symptoms */}
        <Card>
          <CardTitle className="flex items-center gap-2 mb-5">
            <Flame className="w-5 h-5 text-coral-500" />
            Symptoms
          </CardTitle>
          <div className="space-y-6">
            <Controller
              name="hot_flushes_count"
              control={control}
              render={({ field }) => (
                <RangeSlider
                  label="Hot flushes today"
                  min={0}
                  max={20}
                  value={field.value}
                  onChange={field.onChange}
                  color="coral"
                />
              )}
            />
            <Controller
              name="night_sweats_count"
              control={control}
              render={({ field }) => (
                <RangeSlider
                  label="Night sweats last night"
                  min={0}
                  max={10}
                  value={field.value}
                  onChange={field.onChange}
                  color="purple"
                />
              )}
            />
            <Controller
              name="joint_pain_level"
              control={control}
              render={({ field }) => (
                <RangeSlider
                  label="Joint pain (0 = none)"
                  min={0}
                  max={10}
                  value={field.value}
                  onChange={field.onChange}
                  color="teal"
                />
              )}
            />
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <label className="label flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary-400" />
                Brain fog today?
              </label>
              <Controller
                name="brain_fog"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors duration-200",
                      field.value ? "bg-primary-500" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                        field.value ? "translate-x-7" : "translate-x-1"
                      )}
                    />
                  </button>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Sleep */}
        <Card>
          <CardTitle className="flex items-center gap-2 mb-5">
            <Moon className="w-5 h-5 text-teal-500" />
            Sleep
          </CardTitle>
          <div className="space-y-6">
            <Controller
              name="sleep_quality"
              control={control}
              render={({ field }) => (
                <RangeSlider
                  label="Sleep quality (1–10)"
                  min={1}
                  max={10}
                  value={field.value ?? 5}
                  onChange={field.onChange}
                  color="teal"
                />
              )}
            />
            <div>
              <label className="label">Hours slept</label>
              <Input
                type="number"
                step="0.5"
                min={0}
                max={12}
                placeholder="e.g. 7.5"
                error={errors.sleep_hours?.message}
                {...register("sleep_hours", { valueAsNumber: true })}
              />
            </div>
          </div>
        </Card>

        {/* Mood & Energy */}
        <Card>
          <CardTitle className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-amber-500" />
            Mood & Energy
          </CardTitle>
          <div className="space-y-5">
            <div>
              <label className="label">How&apos;s your mood today?</label>
              <Controller
                name="mood"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {MOOD_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(field.value === opt.value ? null : opt.value)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                          field.value === opt.value
                            ? opt.color
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
            <Controller
              name="energy_level"
              control={control}
              render={({ field }) => (
                <RangeSlider
                  label="Energy level (1–10)"
                  min={1}
                  max={10}
                  value={field.value ?? 5}
                  onChange={field.onChange}
                  color="teal"
                />
              )}
            />
          </div>
        </Card>

        {/* Triggers */}
        <Card>
          <CardTitle className="mb-5">Lifestyle & Triggers</CardTitle>
          <div className="space-y-4">
            <div>
              <label className="label">Today I had...</label>
              <div className="flex flex-wrap gap-2">
                <Controller
                  name="alcohol_consumed"
                  control={control}
                  render={({ field }) => (
                    <ToggleChip label="🍷 Alcohol" checked={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  name="caffeine_after_2pm"
                  control={control}
                  render={({ field }) => (
                    <ToggleChip label="☕ Caffeine after 2pm" checked={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  name="spicy_food"
                  control={control}
                  render={({ field }) => (
                    <ToggleChip label="🌶 Spicy food" checked={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  name="high_stress"
                  control={control}
                  render={({ field }) => (
                    <ToggleChip label="😰 High stress" checked={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  name="period_today"
                  control={control}
                  render={({ field }) => (
                    <ToggleChip label="🔴 Period today" checked={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            <div>
              <label className="label">Exercise today</label>
              <Controller
                name="exercise"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {EXERCISE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => field.onChange(field.value === opt ? null : opt)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm border transition-all",
                          field.value === opt
                            ? "bg-teal-100 text-teal-700 border-teal-300"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Encouragement on hard days */}
        {isHardDay && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: "linear-gradient(135deg, #FFF0EE 0%, #FFE8E5 100%)", border: "1px solid rgba(212,103,90,0.2)" }}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">💙</span>
            <div>
              <p className="text-sm font-semibold text-rose-800">Tough day — that&apos;s okay</p>
              <p className="text-sm text-rose-700 mt-0.5 leading-relaxed">
                Recording difficult days matters most. Every log brings you closer to understanding your patterns and finding relief. You&apos;re doing the right thing.
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        <Card>
          <CardTitle className="mb-3">Notes</CardTitle>
          <div>
            <label className="label">Anything else to note today?</label>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Unusual symptoms, new medication, life events, travel..."
              {...register("notes")}
            />
          </div>
        </Card>

        {/* Save */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {saved && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <p className="text-sm text-teal-700">Log saved successfully!</p>
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={saving}>
          {existingLog ? "Update Log" : "Save Log"}
        </Button>
      </form>
    </div>
  );
}
