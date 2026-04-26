"use client";

import { getTopInsight } from "@/lib/utils";
import type { DailyLog } from "@/types/database";
import { Lightbulb } from "lucide-react";

export default function AhaMoment({ logs }: { logs: DailyLog[] }) {
  const insight = getTopInsight(logs);
  if (!insight) return null;

  return (
    <div className="rounded-2xl p-4 flex items-start gap-3"
         style={{ background: "linear-gradient(135deg, #FFF8E7 0%, #FFF3CD 100%)", border: "1px solid rgba(212,167,90,0.25)" }}>
      <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-0.5">Your Data Shows</p>
        <p className="text-sm font-semibold text-amber-900">{insight}</p>
        <p className="text-xs text-amber-700 mt-1">Based on your last 30 days of tracking.</p>
      </div>
    </div>
  );
}
