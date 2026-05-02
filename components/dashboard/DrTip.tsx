"use client";

import { getTodaysTip } from "@/lib/utils";
import Image from "next/image";

export default function DrTip() {
  const tip = getTodaysTip();
  return (
    <div className="card" style={{ background: "linear-gradient(135deg, #F8E7E1 0%, #F3F7F4 100%)", border: "1px solid rgba(59,36,28,0.08)" }}>
      <div className="flex items-start gap-3">
        <Image
          src="/pausesleep-logo.png"
          alt="Dr. Premila Hewage"
          width={44}
          height={44}
          className="rounded-full flex-shrink-0"
          style={{ boxShadow: "0 2px 8px rgba(59,36,28,0.18)" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-xs font-bold text-primary-700" style={{ fontFamily: "Cormorant Garamond, sans-serif" }}>
              Dr. Premila Hewage, GP
            </p>
            <span className="text-[10px] font-semibold bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
              {tip.category}
            </span>
          </div>
          <p className="font-display text-base text-gray-800 leading-relaxed">&ldquo;{tip.tip}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
