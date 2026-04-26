"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/demo-data";
import type { Supplement } from "@/types/database";
import Card, { CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Leaf, Plus, X, Star } from "lucide-react";

const TIMES_OF_DAY = ["Morning", "Midday", "Evening", "Bedtime", "With meals", "As needed"];

const schema = z.object({
  supplement_name: z.string().min(1, "Name required"),
  dose: z.string().optional(),
  time_of_day: z.string().optional(),
  start_date: z.string().min(1, "Start date required"),
  effectiveness_rating: z.number().min(1).max(10).optional().nullable(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const ratingValue = watch("effectiveness_rating");

  async function fetchSupplements() {
    if (isDemoMode()) { setSupplements([]); setLoading(false); return; }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("supplements")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });
    setSupplements(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchSupplements(); }, []);

  async function onSubmit(data: FormData) {
    setSaving(true);
    if (isDemoMode()) { setSaving(false); setShowForm(false); reset(); return; }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from("supplements").insert({
      user_id: user.id,
      supplement_name: data.supplement_name,
      dose: data.dose || null,
      time_of_day: data.time_of_day || null,
      start_date: data.start_date,
      effectiveness_rating: data.effectiveness_rating || null,
      notes: data.notes || null,
      is_active: true,
    });
    await fetchSupplements();
    reset();
    setShowForm(false);
    setSaving(false);
  }

  async function stopSupplement(id: string) {
    const supabase = createClient();
    await supabase.from("supplements").update({ is_active: false }).eq("id", id);
    await fetchSupplements();
  }

  const active = supplements.filter((s) => s.is_active);
  const past = supplements.filter((s) => !s.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Supplements</h1>
          <p className="page-sub">Track vitamins, herbs, and supplements</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Add Supplement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardTitle className="mb-4">Add Supplement</CardTitle>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Supplement name"
                placeholder="e.g. Magnesium glycinate"
                error={errors.supplement_name?.message}
                {...register("supplement_name")}
              />
              <Input
                label="Dose"
                placeholder="e.g. 400mg"
                {...register("dose")}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Time of day</label>
                <select className="input" {...register("time_of_day")}>
                  <option value="">Select time...</option>
                  {TIMES_OF_DAY.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Start date"
                type="date"
                error={errors.start_date?.message}
                {...register("start_date")}
              />
            </div>
            <div>
              <label className="label">Effectiveness rating (1–10, optional)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setValue("effectiveness_rating", ratingValue === n ? null : n)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      ratingValue === n
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-primary-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea className="input min-h-[80px]" placeholder="Side effects, observations..." {...register("notes")} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>Save Supplement</Button>
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
      ) : active.length === 0 && !showForm ? (
        <EmptyState
          icon={Leaf}
          title="No supplements yet"
          description="Track magnesium, black cohosh, probiotics, and any other supplements you're taking."
          actionLabel="Add Supplement"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#1B1A44] mb-3">Current Supplements</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {active.map((s) => (
                  <Card key={s.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-teal-500" />
                          </div>
                          <h3 className="font-semibold text-[#1B1A44] text-sm">{s.supplement_name}</h3>
                        </div>
                        <div className="mt-2 space-y-0.5 pl-10">
                          {s.dose && <p className="text-xs text-gray-500">{s.dose}</p>}
                          {s.time_of_day && <p className="text-xs text-gray-400">🕐 {s.time_of_day}</p>}
                          <p className="text-xs text-gray-400">
                            Since {format(parseISO(s.start_date), "dd MMM yyyy")}
                          </p>
                          {s.effectiveness_rating && (
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(s.effectiveness_rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                              <span className="text-xs text-gray-400 ml-1">{s.effectiveness_rating}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => stopSupplement(s.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {s.notes && (
                      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100 pl-10">{s.notes}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-400 mb-3">Past Supplements</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {past.map((s) => (
                  <div key={s.id} className="bg-gray-50 rounded-xl px-4 py-3 opacity-60">
                    <p className="text-sm font-medium text-gray-600">{s.supplement_name}</p>
                    {s.dose && <p className="text-xs text-gray-400">{s.dose}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
