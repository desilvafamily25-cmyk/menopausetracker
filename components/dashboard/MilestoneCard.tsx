"use client";

import { getMilestone } from "@/lib/utils";
import type { DailyLog } from "@/types/database";
import { useState } from "react";
import { X } from "lucide-react";

export default function MilestoneCard({ logs }: { logs: DailyLog[] }) {
  const [dismissed, setDismissed] = useState(false);
  const milestone = getMilestone(logs);

  if (!milestone || dismissed) return null;

  const emojis: Record<number, string> = { 7: "🌱", 14: "🌿", 30: "🏆", 60: "⭐", 90: "🎖️" };
  const emoji = emojis[milestone.days] ?? "🎉";

  return (
    <div className="rounded-2xl p-4 flex items-center gap-3"
         style={{ background: "linear-gradient(135deg, #E8F7F3 0%, #D1F0E8 100%)", border: "1px solid rgba(61,107,91,0.2)" }}>
      <span className="text-3xl flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-teal-800 uppercase tracking-wide">{milestone.days}-Day Milestone</p>
        <p className="text-sm font-semibold text-teal-900 mt-0.5">{milestone.message}</p>
      </div>
      <button onClick={() => setDismissed(true)} className="p-1.5 hover:bg-teal-200 rounded-lg transition-colors flex-shrink-0">
        <X className="w-4 h-4 text-teal-600" />
      </button>
    </div>
  );
}
