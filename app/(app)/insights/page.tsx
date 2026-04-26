"use client";

import { useLogs } from "@/hooks/useLogs";
import {
  getLast7Days,
  getLast30Days,
  average,
  identifyTriggers,
  moodToNumber,
} from "@/lib/utils";
import Card, { CardTitle } from "@/components/ui/Card";
import HotFlushChart from "@/components/charts/HotFlushChart";
import SleepQualityChart from "@/components/charts/SleepQualityChart";
import TriggerChart from "@/components/charts/TriggerChart";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, getDay } from "date-fns";
import type { DailyLog } from "@/types/database";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function avg(nums: (number | null | undefined)[]) {
  return Math.round(average(nums) * 10) / 10;
}

function SummaryRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-[#1B1A44]">{value}</span>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

function DayOfWeekChart({ logs }: { logs: DailyLog[] }) {
  const byDay: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  logs.forEach((l) => {
    const day = getDay(parseISO(l.log_date));
    byDay[day].push(l.hot_flushes_count);
  });

  const data = DAY_NAMES.map((name, i) => ({
    day: name,
    avg: byDay[i].length ? Math.round(average(byDay[i]) * 10) / 10 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: 12 }}
        />
        <Bar dataKey="avg" fill="#8B7BA8" radius={[4, 4, 0, 0]} name="Avg hot flushes" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function InsightsPage() {
  const { logs, loading } = useLogs();

  if (loading) return <DashboardSkeleton />;

  const last7 = getLast7Days(logs);
  const last30 = getLast30Days(logs);
  const triggers = identifyTriggers(last30);

  const best7 = last7.reduce(
    (best, l) => (l.hot_flushes_count < (best?.hot_flushes_count ?? Infinity) ? l : best),
    null as DailyLog | null
  );
  const worst7 = last7.reduce(
    (worst, l) => (l.hot_flushes_count > (worst?.hot_flushes_count ?? -1) ? l : worst),
    null as DailyLog | null
  );

  const avgFlush30 = avg(last30.map((l) => l.hot_flushes_count));
  const avgFlush7 = avg(last7.map((l) => l.hot_flushes_count));
  const prevWeek = last30.slice(7, 14);
  const prevFlush = avg(prevWeek.map((l) => l.hot_flushes_count));

  const trend =
    last7.length && prevWeek.length
      ? avgFlush7 < prevFlush
        ? "improving"
        : avgFlush7 > prevFlush
        ? "worsening"
        : "stable"
      : "stable";

  const daysWithBrainFog = last30.filter((l) => l.brain_fog).length;
  const daysWithPeriod = last30.filter((l) => l.period_today).length;

  const moodScores = last7.map((l) => moodToNumber(l.mood)).filter((v) => v > 0);
  const avgMood = moodScores.length ? Math.round((average(moodScores) / 5) * 10) / 10 : null;

  if (!logs.length) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📊</p>
        <h2 className="text-xl font-semibold text-[#1B1A44] mb-2">No data yet</h2>
        <p className="text-gray-500 text-sm">Start logging daily to unlock insights and patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Insights</h1>
        <p className="page-sub">Patterns and trends from your symptom data</p>
      </div>

      {/* Trend banner */}
      {last7.length > 0 && (
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${
          trend === "improving" ? "bg-teal-50 border border-teal-200" :
          trend === "worsening" ? "bg-coral-50 border border-coral-200" :
          "bg-gray-50 border border-gray-200"
        }`}>
          {trend === "improving" && <TrendingDown className="w-6 h-6 text-teal-600 flex-shrink-0" />}
          {trend === "worsening" && <TrendingUp className="w-6 h-6 text-coral-600 flex-shrink-0" />}
          {trend === "stable" && <Minus className="w-6 h-6 text-gray-500 flex-shrink-0" />}
          <div>
            <p className={`font-semibold text-sm ${
              trend === "improving" ? "text-teal-700" :
              trend === "worsening" ? "text-coral-700" : "text-gray-700"
            }`}>
              {trend === "improving" && "Improving — Hot flushes down this week"}
              {trend === "worsening" && "Worsening — Hot flushes up this week"}
              {trend === "stable" && "Stable — Similar to last week"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              This week: {avgFlush7} avg vs. last week: {prevFlush} avg
            </p>
          </div>
        </div>
      )}

      {/* 7-day summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardTitle className="mb-4">Last 7 Days</CardTitle>
          <SummaryRow label="Total hot flushes" value={last7.reduce((s, l) => s + l.hot_flushes_count, 0)} />
          <SummaryRow label="Avg hot flushes / day" value={avgFlush7} />
          <SummaryRow label="Avg sleep quality" value={avg(last7.map((l) => l.sleep_quality)) || "—"} sub="out of 10" />
          <SummaryRow label="Avg energy" value={avg(last7.map((l) => l.energy_level)) || "—"} sub="out of 10" />
          <SummaryRow label="Avg mood" value={avgMood ? `${(avgMood * 100).toFixed(0)}%` : "—"} />
          {best7 && (
            <SummaryRow
              label="Best day"
              value={format(parseISO(best7.log_date), "dd MMM")}
              sub={`${best7.hot_flushes_count} hot flushes`}
            />
          )}
          {worst7 && (
            <SummaryRow
              label="Most challenging day"
              value={format(parseISO(worst7.log_date), "dd MMM")}
              sub={`${worst7.hot_flushes_count} hot flushes`}
            />
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Last 30 Days</CardTitle>
          <SummaryRow label="Total hot flushes" value={last30.reduce((s, l) => s + l.hot_flushes_count, 0)} />
          <SummaryRow label="Avg hot flushes / day" value={avgFlush30} />
          <SummaryRow
            label="Total night sweats"
            value={last30.reduce((s, l) => s + l.night_sweats_count, 0)}
          />
          <SummaryRow label="Days with brain fog" value={daysWithBrainFog} sub={`of ${last30.length} days`} />
          <SummaryRow label="Days with period" value={daysWithPeriod} />
          <SummaryRow
            label="Avg sleep quality"
            value={avg(last30.map((l) => l.sleep_quality)) || "—"}
            sub="out of 10"
          />
          <SummaryRow
            label="Avg sleep hours"
            value={avg(last30.map((l) => l.sleep_hours)) || "—"}
            sub="hours/night"
          />
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardTitle className="mb-1">Hot Flushes Trend</CardTitle>
        <p className="text-xs text-gray-400 mb-4">Daily count over last 30 days</p>
        <HotFlushChart logs={last30} />
      </Card>

      <Card>
        <CardTitle className="mb-1">Sleep Quality Trend</CardTitle>
        <p className="text-xs text-gray-400 mb-4">Quality score (1–10) over last 30 days</p>
        <SleepQualityChart logs={last30} />
      </Card>

      <Card>
        <CardTitle className="mb-1">Hot Flushes by Day of Week</CardTitle>
        <p className="text-xs text-gray-400 mb-4">Are your symptoms worse on certain days?</p>
        <DayOfWeekChart logs={last30} />
      </Card>

      {/* Trigger analysis */}
      <Card>
        <CardTitle className="mb-1">Trigger Analysis</CardTitle>
        <p className="text-xs text-gray-400 mb-4">
          Avg hot flushes on days with vs. without each trigger (last 30 days)
        </p>
        <TriggerChart logs={last30} />

        <div className="mt-5 space-y-3">
          {triggers.map((t) => (
            <div key={t.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">{t.trigger}</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-coral-600 font-medium">With: {t.avgWith}</span>
                <span className="text-teal-600 font-medium">Without: {t.avgWithout}</span>
                <span
                  className={`font-bold ${
                    t.impact > 1 ? "text-coral-600" : t.impact < 0 ? "text-teal-600" : "text-gray-500"
                  }`}
                >
                  {t.impact > 0 ? "+" : ""}{t.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
