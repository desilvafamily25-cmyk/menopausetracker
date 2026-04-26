"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInDays, subDays, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/demo-data";
import { useLogs } from "@/hooks/useLogs";
import { average } from "@/lib/utils";
import type { Treatment } from "@/types/database";
import Card, { CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Pill, Plus, X, TrendingDown, TrendingUp } from "lucide-react";

const schema = z.object({
  treatment_name: z.string().min(1, "Treatment name required"),
  dose: z.string().optional(),
  start_date: z.string().min(1, "Start date required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function TreatmentsPage() {
  const { logs } = useLogs();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stoppingId, setStoppingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function fetchTreatments() {
    if (isDemoMode()) { setTreatments([]); setLoading(false); return; }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("treatments")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });
    setTreatments(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchTreatments(); }, []);

  async function onSubmit(data: FormData) {
    setSaving(true);
    if (isDemoMode()) { setSaving(false); setShowForm(false); reset(); return; }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from("treatments").insert({
      user_id: user.id,
      treatment_name: data.treatment_name,
      dose: data.dose || null,
      start_date: data.start_date,
      notes: data.notes || null,
      is_active: true,
    });
    await fetchTreatments();
    reset();
    setShowForm(false);
    setSaving(false);
  }

  async function stopTreatment(id: string) {
    setStoppingId(id);
    const supabase = createClient();
    await supabase
      .from("treatments")
      .update({ is_active: false, end_date: format(new Date(), "yyyy-MM-dd") })
      .eq("id", id);
    await fetchTreatments();
    setStoppingId(null);
  }

  function getMetrics(treatment: Treatment) {
    const startDate = parseISO(treatment.start_date);
    const daysOn = differenceInDays(new Date(), startDate);

    // Before: 7 days before start
    const beforeStart = subDays(startDate, 7);
    const beforeLogs = logs.filter((l) => {
      const d = parseISO(l.log_date);
      return d >= beforeStart && d < startDate;
    });

    // During treatment
    const duringLogs = logs.filter((l) => {
      const d = parseISO(l.log_date);
      return d >= startDate;
    });

    const beforeAvg = Math.round(average(beforeLogs.map((l) => l.hot_flushes_count)) * 10) / 10;
    const duringAvg = Math.round(average(duringLogs.map((l) => l.hot_flushes_count)) * 10) / 10;
    const improvement =
      beforeAvg > 0 ? Math.round(((beforeAvg - duringAvg) / beforeAvg) * 100) : null;

    return { daysOn, beforeAvg, duringAvg, improvement, hasData: beforeLogs.length > 0 && duringLogs.length > 0 };
  }

  const active = treatments.filter((t) => t.is_active);
  const past = treatments.filter((t) => !t.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Treatments</h1>
          <p className="page-sub">Track HRT and other treatments with before/after analysis</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Add Treatment
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardTitle className="mb-4">Add New Treatment</CardTitle>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Treatment name"
                placeholder="e.g. Estradiol patch"
                error={errors.treatment_name?.message}
                {...register("treatment_name")}
              />
              <Input
                label="Dose"
                placeholder="e.g. 50mcg / daily"
                {...register("dose")}
              />
            </div>
            <Input
              label="Start date"
              type="date"
              error={errors.start_date?.message}
              {...register("start_date")}
            />
            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Any notes about this treatment..."
                {...register("notes")}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>Save Treatment</Button>
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
        </div>
      ) : active.length === 0 && !showForm ? (
        <EmptyState
          icon={Pill}
          title="No treatments yet"
          description="Add your current HRT, medication, or any other treatment to track its effectiveness."
          actionLabel="Add Treatment"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#1B1A44] mb-3">Active Treatments</h2>
              <div className="space-y-4">
                {active.map((t) => {
                  const m = getMetrics(t);
                  return (
                    <Card key={t.id}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[#1B1A44]">{t.treatment_name}</h3>
                          {t.dose && <p className="text-sm text-gray-500">{t.dose}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">
                            Started {format(parseISO(t.start_date), "dd MMM yyyy")} · {m.daysOn} days
                          </p>
                        </div>
                        <button
                          onClick={() => stopTreatment(t.id)}
                          disabled={stoppingId === t.id}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          {stoppingId === t.id ? "Stopping…" : "Stop"}
                        </button>
                      </div>

                      {m.hasData ? (
                        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-500">{m.beforeAvg}</p>
                            <p className="text-xs text-gray-400">Before (avg)</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary-600">{m.duringAvg}</p>
                            <p className="text-xs text-gray-400">On treatment</p>
                          </div>
                          <div className="text-center">
                            {m.improvement !== null ? (
                              <>
                                <p className={`text-lg font-bold flex items-center justify-center gap-1 ${
                                  m.improvement > 0 ? "text-teal-600" : "text-coral-600"
                                }`}>
                                  {m.improvement > 0 ? (
                                    <TrendingDown className="w-4 h-4" />
                                  ) : (
                                    <TrendingUp className="w-4 h-4" />
                                  )}
                                  {Math.abs(m.improvement)}%
                                </p>
                                <p className="text-xs text-gray-400">
                                  {m.improvement > 0 ? "Improvement" : "Increase"}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-400">No comparison yet</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 pt-3 border-t border-gray-100">
                          Log symptoms before and after start date to see effectiveness data.
                        </p>
                      )}

                      {t.notes && (
                        <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">{t.notes}</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-500 mb-3">Past Treatments</h2>
              <div className="space-y-3">
                {past.map((t) => (
                  <Card key={t.id} className="opacity-70">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[#1B1A44]">{t.treatment_name}</h3>
                        {t.dose && <p className="text-xs text-gray-500">{t.dose}</p>}
                      </div>
                      <p className="text-xs text-gray-400">
                        {format(parseISO(t.start_date), "dd MMM yy")} →{" "}
                        {t.end_date ? format(parseISO(t.end_date), "dd MMM yy") : "Ongoing"}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
