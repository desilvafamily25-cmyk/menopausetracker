"use client";

import { getWeekComparison } from "@/lib/utils";
import type { DailyLog } from "@/types/database";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function WeeklyInsight({ logs }: { logs: DailyLog[] }) {
  const cmp = getWeekComparison(logs);
  if (!cmp.hasData) return null;

  const flushImproving = cmp.flushesChange < -0.5;
  const flushWorsening = cmp.flushesChange > 0.5;
  const sleepImproving = cmp.sleepChange > 0.3;

  return (
    <div className="card">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">This Week vs Last Week</p>
      <div className="grid grid-cols-2 gap-3">
        {/* Hot flushes */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            {flushImproving ? (
              <TrendingDown className="w-4 h-4 text-teal-600" />
            ) : flushWorsening ? (
              <TrendingUp className="w-4 h-4 text-coral-500" />
            ) : (
              <Minus className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-xs font-semibold text-gray-600">Hot Flushes</span>
          </div>
          <p className={`text-xl font-bold ${flushImproving ? "text-teal-600" : flushWorsening ? "text-coral-500" : "text-gray-700"}`}>
            {cmp.flushesChange > 0 ? "+" : ""}{cmp.flushesChange}/day
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{cmp.flushesThis} vs {cmp.flushesLast} avg</p>
        </div>

        {/* Sleep */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            {sleepImproving ? (
              <TrendingUp className="w-4 h-4 text-teal-600" />
            ) : cmp.sleepChange < -0.3 ? (
              <TrendingDown className="w-4 h-4 text-coral-500" />
            ) : (
              <Minus className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-xs font-semibold text-gray-600">Sleep Quality</span>
          </div>
          <p className={`text-xl font-bold ${sleepImproving ? "text-teal-600" : cmp.sleepChange < -0.3 ? "text-coral-500" : "text-gray-700"}`}>
            {cmp.sleepChange >= 0 ? "+" : ""}{cmp.sleepChange}/10
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{cmp.sleepThis} vs {cmp.sleepLast} avg</p>
        </div>
      </div>
    </div>
  );
}
