"use client";

import { getTodaysTip } from "@/lib/utils";
import Image from "next/image";

export default function DrTip() {
  const tip = getTodaysTip();
  return (
    <div className="card" style={{ background: "linear-gradient(135deg, #F0EEF8 0%, #EBF2EF 100%)", border: "1px solid rgba(27,26,68,0.08)" }}>
      <div className="flex items-start gap-3">
        <Image
          src="/pausesleep-logo.png"
          alt="Dr. Premila Hewage"
          width={44}
          height={44}
          className="rounded-full flex-shrink-0"
          style={{ boxShadow: "0 2px 8px rgba(27,26,68,0.18)" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-xs font-bold text-primary-700" style={{ fontFamily: "Poppins, sans-serif" }}>
              Dr. Premila Hewage, GP
            </p>
            <span className="text-[10px] font-semibold bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
              {tip.category}
            </span>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">&ldquo;{tip.tip}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
