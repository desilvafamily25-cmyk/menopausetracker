"use client";

import { useRef, useState } from "react";
import { useLogs } from "@/hooks/useLogs";
import { useUser } from "@/hooks/useUser";
import { getLast30Days, average, identifyTriggers, formatDate } from "@/lib/utils";
import { format, subDays } from "date-fns";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { Printer, Download, FileText, CheckCircle2, AlertCircle, Info } from "lucide-react";

function avg(nums: (number | null | undefined)[]) {
  return Math.round(average(nums) * 10) / 10;
}

function generateExecutiveSummary(stats: {
  avgHotFlushes: number;
  avgSleepQuality: number;
  avgEnergy: number;
  daysWithBrainFog: number;
  daysLogged: number;
  daysWithHighStress: number;
}, triggers: { trigger: string; impact: number }[]) {
  const lines: string[] = [];

  if (stats.avgHotFlushes >= 8) {
    lines.push(`Hot flush frequency is HIGH at ${stats.avgHotFlushes}/day average — consistent with significant vasomotor symptoms requiring clinical attention.`);
  } else if (stats.avgHotFlushes >= 4) {
    lines.push(`Hot flush frequency is MODERATE at ${stats.avgHotFlushes}/day average — affecting quality of life and warranting management review.`);
  } else if (stats.avgHotFlushes > 0) {
    lines.push(`Hot flush frequency is MILD at ${stats.avgHotFlushes}/day average — currently manageable.`);
  }

  if (stats.avgSleepQuality && stats.avgSleepQuality <= 4) {
    lines.push(`Sleep quality is SIGNIFICANTLY IMPAIRED (avg ${stats.avgSleepQuality}/10) — this is impacting daytime function and wellbeing.`);
  } else if (stats.avgSleepQuality && stats.avgSleepQuality <= 6) {
    lines.push(`Sleep quality is MODERATELY AFFECTED (avg ${stats.avgSleepQuality}/10) — consider reviewing sleep hygiene and symptom management.`);
  }

  if (stats.daysWithBrainFog > stats.daysLogged * 0.5) {
    lines.push(`Brain fog reported on ${stats.daysWithBrainFog} of ${stats.daysLogged} tracked days — cognitive symptoms are a significant concern.`);
  }

  const topTrigger = triggers.find((t) => t.impact > 1);
  if (topTrigger) {
    lines.push(`Data shows ${topTrigger.trigger.toLowerCase()} is associated with +${topTrigger.impact} additional hot flushes — lifestyle modification may provide relief.`);
  }

  if (lines.length === 0) {
    lines.push("Symptom levels appear within a manageable range based on tracked data.");
  }

  return lines;
}

function generateDiscussionPoints(stats: {
  avgHotFlushes: number;
  avgSleepQuality: number;
  avgEnergy: number;
  daysWithBrainFog: number;
  daysLogged: number;
  avgNightSweats: number;
}, triggers: { trigger: string; impact: number }[]): string[] {
  const points: string[] = [];

  if (stats.avgHotFlushes >= 6) {
    points.push("Should I consider starting or adjusting HRT given my hot flush frequency?");
  } else {
    points.push("Are my current hot flush levels within normal range for my stage of menopause?");
  }

  if (stats.avgSleepQuality && stats.avgSleepQuality <= 5) {
    points.push("My sleep quality is consistently poor — are there targeted treatments or strategies I should try?");
  } else {
    points.push("What can I do to further improve my sleep quality?");
  }

  const topTrigger = triggers.find((t) => t.impact > 0);
  if (topTrigger) {
    points.push(`My data shows ${topTrigger.trigger.toLowerCase()} worsens my symptoms — what's the best way to address this?`);
  } else {
    points.push("What lifestyle changes would have the most impact on my symptoms?");
  }

  if (stats.daysWithBrainFog > 5) {
    points.push("I'm experiencing brain fog frequently — is this hormonal and how do I manage it?");
  }

  if (stats.avgNightSweats > 1) {
    points.push(`I'm averaging ${stats.avgNightSweats} night sweats per night — can we address this specifically?`);
  }

  points.push("Based on my 30 days of data, what is the next step in my menopause management plan?");

  return points.slice(0, 5);
}

const DEFAULT_QUESTIONS = [
  "Should I adjust my current HRT dosage based on these symptoms?",
  "Are these symptom levels within normal range for my stage of menopause?",
  "What are the identified triggers I should prioritise addressing?",
  "Are my sleep quality scores a concern, and what can I do?",
  "Based on this data, what is the next step in my management plan?",
];

export default function DoctorReportPage() {
  const { logs, loading } = useLogs();
  const { user } = useUser();
  const printRef = useRef<HTMLDivElement>(null);
  const [useSmartQuestions, setUseSmartQuestions] = useState(true);
  const [customQuestions, setCustomQuestions] = useState(DEFAULT_QUESTIONS);
  const [editingQ, setEditingQ] = useState<number | null>(null);

  const last30 = getLast30Days(logs);
  const triggers = identifyTriggers(last30).slice(0, 5);

  const stats = {
    avgHotFlushes: avg(last30.map((l) => l.hot_flushes_count)),
    totalHotFlushes: last30.reduce((s, l) => s + l.hot_flushes_count, 0),
    avgNightSweats: avg(last30.map((l) => l.night_sweats_count)),
    avgSleepQuality: avg(last30.map((l) => l.sleep_quality)),
    avgSleepHours: avg(last30.map((l) => l.sleep_hours)),
    avgEnergy: avg(last30.map((l) => l.energy_level)),
    daysLogged: last30.length,
    daysWithBrainFog: last30.filter((l) => l.brain_fog).length,
    daysWithHighStress: last30.filter((l) => l.high_stress).length,
  };

  const executiveSummary = generateExecutiveSummary(stats, triggers);
  const smartQuestions = generateDiscussionPoints(stats, triggers);
  const questions = useSmartQuestions ? smartQuestions : customQuestions;

  const dateRange = {
    from: format(subDays(new Date(), 30), "dd MMM yyyy"),
    to: format(new Date(), "dd MMM yyyy"),
  };

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    while (position < pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
      position += pageHeight;
      if (position < pdfHeight) pdf.addPage();
    }

    pdf.save(`menopause-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <h1 className="page-header">Doctor Report</h1>
          <p className="page-sub">Professional summary for your GP appointment</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button size="sm" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {last30.length === 0 && (
        <div className="card text-center py-12 no-print">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-2">No data for report</h3>
          <p className="text-gray-500 text-sm">Log at least a few days to generate a doctor report.</p>
        </div>
      )}

      {/* Printable report */}
      <div
        ref={printRef}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Report header with Dr. Premila credentials */}
        <div style={{ background: "linear-gradient(135deg, #3B241C 0%, #2D2B5E 100%)" }} className="text-white px-8 py-7">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/pausesleep-logo.png"
                alt="Pause Sleep"
                width={52}
                height={52}
                className="rounded-xl flex-shrink-0"
                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
              />
              <div>
                <h2 className="text-xl font-bold">Menopause Symptom Report</h2>
                <p className="text-primary-200 text-sm mt-0.5">
                  Pause Sleep Tracker — pausesleep.com.au
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-primary-200">
              <p className="font-medium text-white">Period: {dateRange.from} — {dateRange.to}</p>
              <p>Generated: {formatDate(new Date())}</p>
              <p className="mt-1">{stats.daysLogged} days of data</p>
            </div>
          </div>

          {/* Patient + author */}
          <div className="mt-5 pt-5 border-t border-white/20 flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-primary-300 text-xs font-semibold uppercase tracking-wide mb-1">Patient</p>
              <p className="font-medium">{user?.full_name ?? "—"}</p>
              {user?.date_of_birth && <p className="text-primary-200 text-xs mt-0.5">DOB: {user.date_of_birth}</p>}
            </div>
            <div>
              <p className="text-primary-300 text-xs font-semibold uppercase tracking-wide mb-1">App Creator</p>
              <p className="font-medium">Dr. Premila Hewage, MBBS FRACGP</p>
              <p className="text-primary-200 text-xs mt-0.5">General Practitioner · Menopause Medicine</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* Executive Summary */}
          {executiveSummary.length > 0 && last30.length >= 5 && (
            <section>
              <h3 className="font-bold text-lg text-[#3B241C] mb-4 pb-2 border-b-2 border-primary-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary-500" />
                Clinical Interpretation
              </h3>
              <div className="bg-primary-50 rounded-2xl p-5 space-y-2.5">
                {executiveSummary.map((line, i) => {
                  const isHigh = line.includes("HIGH") || line.includes("SIGNIFICANTLY") || line.includes("significant");
                  const isMod = line.includes("MODERATE") || line.includes("moderately");
                  return (
                    <div key={i} className="flex items-start gap-3">
                      {isHigh ? (
                        <AlertCircle className="w-4 h-4 text-coral-500 flex-shrink-0 mt-0.5" />
                      ) : isMod ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-primary-800 leading-relaxed">{line}</p>
                    </div>
                  );
                })}
                <p className="text-xs text-primary-400 pt-2 border-t border-primary-200 mt-2">
                  This interpretation is generated from patient-reported data and should be reviewed in clinical context.
                </p>
              </div>
            </section>
          )}

          {/* Summary statistics */}
          <section>
            <h3 className="font-bold text-lg text-[#3B241C] mb-4 pb-2 border-b border-gray-200">
              Summary Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Avg hot flushes / day", value: stats.avgHotFlushes },
                { label: "Total hot flushes", value: stats.totalHotFlushes },
                { label: "Avg night sweats / day", value: stats.avgNightSweats },
                { label: "Sleep quality (1–10)", value: stats.avgSleepQuality || "N/A" },
                { label: "Sleep hours / night", value: stats.avgSleepHours || "N/A" },
                { label: "Energy level (1–10)", value: stats.avgEnergy || "N/A" },
                { label: "Days with brain fog", value: `${stats.daysWithBrainFog} / ${stats.daysLogged}` },
                { label: "High-stress days", value: `${stats.daysWithHighStress} / ${stats.daysLogged}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-primary-600 mb-1">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Top triggers */}
          {triggers.length > 0 && (
            <section>
              <h3 className="font-bold text-lg text-[#3B241C] mb-4 pb-2 border-b border-gray-200">
                Identified Triggers (Correlation Analysis)
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 rounded-tl-lg">Trigger</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600">Avg flushes WITH</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600">Avg flushes WITHOUT</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600 rounded-tr-lg">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {triggers.map((t, i) => (
                    <tr key={t.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2.5 text-gray-700">{t.trigger}</td>
                      <td className="text-center px-3 py-2.5 text-coral-600 font-medium">{t.avgWith}</td>
                      <td className="text-center px-3 py-2.5 text-teal-600 font-medium">{t.avgWithout}</td>
                      <td className="text-center px-3 py-2.5">
                        <span className={`font-bold ${t.impact > 1 ? "text-coral-600" : "text-teal-600"}`}>
                          {t.impact > 0 ? "+" : ""}{t.impact}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Daily log table */}
          <section>
            <h3 className="font-bold text-lg text-[#3B241C] mb-4 pb-2 border-b border-gray-200">
              Daily Log Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {["Date", "Hot Flushes", "Night Sweats", "Sleep Q", "Sleep Hrs", "Energy", "Mood", "Brain Fog", "Triggers"].map(
                      (h) => (
                        <th key={h} className="text-left px-2 py-2 font-semibold text-gray-600">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {last30
                    .sort((a, b) => b.log_date.localeCompare(a.log_date))
                    .map((l, i) => {
                      const triggerFlags = [
                        l.alcohol_consumed && "Alc",
                        l.caffeine_after_2pm && "Caff",
                        l.spicy_food && "Spicy",
                        l.high_stress && "Stress",
                      ]
                        .filter(Boolean)
                        .join(", ");
                      return (
                        <tr key={l.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-2 py-1.5">{format(new Date(l.log_date), "dd/MM")}</td>
                          <td className="px-2 py-1.5 text-center">{l.hot_flushes_count}</td>
                          <td className="px-2 py-1.5 text-center">{l.night_sweats_count}</td>
                          <td className="px-2 py-1.5 text-center">{l.sleep_quality ?? "—"}</td>
                          <td className="px-2 py-1.5 text-center">{l.sleep_hours ?? "—"}</td>
                          <td className="px-2 py-1.5 text-center">{l.energy_level ?? "—"}</td>
                          <td className="px-2 py-1.5 capitalize">{l.mood ?? "—"}</td>
                          <td className="px-2 py-1.5 text-center">{l.brain_fog ? "Yes" : "No"}</td>
                          <td className="px-2 py-1.5 text-gray-500">{triggerFlags || "None"}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Questions for GP */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h3 className="font-bold text-lg text-[#3B241C]">Questions for My Doctor</h3>
              {last30.length >= 5 && (
                <button
                  onClick={() => setUseSmartQuestions(!useSmartQuestions)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 no-print flex items-center gap-1"
                >
                  {useSmartQuestions ? "✏ Edit questions" : "✦ Use smart questions"}
                </button>
              )}
            </div>

            {useSmartQuestions && last30.length >= 5 ? (
              <div className="bg-teal-50 rounded-xl p-4 mb-3 no-print">
                <p className="text-xs font-semibold text-teal-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Smart questions generated from your data
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 group">
                  <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {!useSmartQuestions && editingQ === i ? (
                    <input
                      className="input text-sm flex-1 py-1"
                      value={q}
                      onChange={(e) => {
                        const updated = [...customQuestions];
                        updated[i] = e.target.value;
                        setCustomQuestions(updated);
                      }}
                      onBlur={() => setEditingQ(null)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-sm text-gray-700 flex-1 ${!useSmartQuestions ? "cursor-text hover:text-primary-700 transition-colors" : ""}`}
                      onClick={() => !useSmartQuestions && setEditingQ(i)}
                    >
                      {q}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {!useSmartQuestions && <p className="text-xs text-gray-400 mt-3 no-print">Click any question to edit it.</p>}
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/pausesleep-logo.png"
                  alt="Pause Sleep"
                  width={32}
                  height={32}
                  className="rounded-lg opacity-60"
                />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Pause Sleep Menopause Tracker</p>
                  <p className="text-xs text-gray-400">tracker.pausesleep.com.au</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">Created by Dr. Premila Hewage, MBBS FRACGP</p>
                <p className="text-xs text-gray-400">© {new Date().getFullYear()} Pause Sleep · pausesleep.com.au</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
