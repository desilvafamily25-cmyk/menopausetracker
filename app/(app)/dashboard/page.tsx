"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useLogs } from "@/hooks/useLogs";
import { useUser } from "@/hooks/useUser";
import {
  calculateStreak,
  getLast7Days,
  getLast30Days,
  average,
  identifyTriggers,
  formatDate,
  today,
} from "@/lib/utils";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import HotFlushChart from "@/components/charts/HotFlushChart";
import SleepQualityChart from "@/components/charts/SleepQualityChart";
import TriggerChart from "@/components/charts/TriggerChart";
import QuickLog from "@/components/dashboard/QuickLog";
import AhaMoment from "@/components/dashboard/AhaMoment";
import WeeklyInsight from "@/components/dashboard/WeeklyInsight";
import DrTip from "@/components/dashboard/DrTip";
import MilestoneCard from "@/components/dashboard/MilestoneCard";
import {
  Flame,
  Moon,
  Zap,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  PartyPopper,
} from "lucide-react";
// DashboardHero uses font-display (DM Serif Display) loaded via globals.css

const STAT_THEMES = {
  coral: {
    card: "linear-gradient(145deg, #FDF3F1 0%, #FBF0EE 100%)",
    border: "rgba(212,103,90,0.15)",
    icon: "linear-gradient(135deg, #D4675A 0%, #C05548 100%)",
    value: "#B84035",
    label: "#C05548",
  },
  teal: {
    card: "linear-gradient(145deg, #EDF5F2 0%, #E8F2EF 100%)",
    border: "rgba(61,107,91,0.15)",
    icon: "linear-gradient(135deg, #3D6B5B 0%, #2E5446 100%)",
    value: "#2E5446",
    label: "#3D6B5B",
  },
  amber: {
    card: "linear-gradient(145deg, #FEF9EE 0%, #FDF5E4 100%)",
    border: "rgba(217,119,6,0.15)",
    icon: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
    value: "#92400E",
    label: "#B45309",
  },
  purple: {
    card: "linear-gradient(145deg, #F0EEF8 0%, #ECEAF6 100%)",
    border: "rgba(27,26,68,0.12)",
    icon: "linear-gradient(135deg, #1B1A44 0%, #2D2C6E 100%)",
    value: "#1B1A44",
    label: "#3D3C7A",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "purple",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: "purple" | "teal" | "coral" | "amber";
}) {
  const t = STAT_THEMES[color];
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: "0 1px 3px rgba(15,14,34,0.04), 0 4px 16px rgba(15,14,34,0.05)" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: t.icon }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: t.value }}>{value}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: t.label }}>{label}</p>
        {sub && <p className="text-[11px] mt-0.5 opacity-70" style={{ color: t.label }}>{sub}</p>}
      </div>
    </div>
  );
}

function DashboardHero({ name, streak }: { name?: string; streak: number }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const timeEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";
  const firstName = name?.split(" ")[0];

  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-7"
      style={{ background: "linear-gradient(135deg, #1B1A44 0%, #2A2860 50%, #1E3D35 100%)" }}
    >
      {/* Organic blob shapes */}
      <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(61,107,91,0.35) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(138,158,151,0.20) 0%, transparent 70%)" }} />
      <div className="absolute top-4 right-24 w-32 h-32 rounded-full pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(212,103,90,0.12) 0%, transparent 70%)" }} />

      <div className="relative z-10">
        <p className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-2">
          {timeEmoji} &nbsp;{formatDate(today(), "EEEE, d MMMM yyyy")}
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-white">
          {greeting}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-white/65 text-sm mt-2 font-medium">
          {streak >= 7
            ? `${streak}-day streak 🔥 You're on a roll!`
            : streak > 0
            ? `${streak}-day streak — keep going 💪`
            : "Start your tracking journey today ✨"}
        </p>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user, loading: userLoading } = useUser();
  const { logs, loading: logsLoading } = useLogs();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isWelcome = searchParams.get("welcome") === "true";
  const [showWelcome, setShowWelcome] = useState(isWelcome);

  // Redirect new users to onboarding
  useEffect(() => {
    if (!logsLoading && logs.length === 0) {
      const onboarded = localStorage.getItem("pause_sleep_onboarded");
      if (!onboarded) {
        router.push("/onboarding");
      }
    }
  }, [logsLoading, logs.length, router]);

  useEffect(() => {
    if (isWelcome) {
      const t = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(t);
    }
  }, [isWelcome]);

  if (userLoading || logsLoading) return <DashboardSkeleton />;

  const last7 = getLast7Days(logs);
  const last30 = getLast30Days(logs);
  const streak = calculateStreak(logs);

  const avgHotFlushes7 = Math.round(average(last7.map((l) => l.hot_flushes_count)) * 10) / 10;
  const avgSleep7 = Math.round(average(last7.map((l) => l.sleep_quality)) * 10) / 10;
  const avgEnergy7 = Math.round(average(last7.map((l) => l.energy_level)) * 10) / 10;

  const avgHotFlushes14_28 = (() => {
    const older = last30.slice(14);
    return Math.round(average(older.map((l) => l.hot_flushes_count)) * 10) / 10;
  })();

  const trend =
    avgHotFlushes7 < avgHotFlushes14_28
      ? "improving"
      : avgHotFlushes7 > avgHotFlushes14_28
      ? "worsening"
      : "stable";

  const triggers = identifyTriggers(last30).slice(0, 3);
  const hasTodayLog = logs.some((l) => l.log_date === today());

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero greeting */}
      <DashboardHero name={user?.full_name ?? undefined} streak={streak} />

      {/* Welcome banner (after signup) */}
      {showWelcome && (
        <div className="rounded-2xl p-4 flex items-center gap-3"
             style={{ background: "linear-gradient(135deg, #EBF2EF 0%, #E5F0EC 100%)", border: "1px solid rgba(61,107,91,0.2)" }}>
          <PartyPopper className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-teal-800 flex-1">
            Welcome! Log your first symptoms — 30 days of data generates a powerful doctor report.
          </p>
          <button onClick={() => setShowWelcome(false)} className="text-teal-500 hover:text-teal-700 text-lg leading-none flex-shrink-0">✕</button>
        </div>
      )}

      {/* Log today CTA — only when not logged */}
      {!hasTodayLog && logs.length > 0 && (
        <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3"
             style={{ border: "1px solid rgba(27,26,68,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-primary-500" />
            <p className="text-sm font-semibold text-primary-700">Today&apos;s log not done yet</p>
          </div>
          <Link href="/log">
            <Button size="sm" className="gap-1.5 text-xs">
              Log now <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Milestone celebration */}
      <MilestoneCard logs={logs} />

      {/* Quick log — only shows if not logged today */}
      <QuickLog onSaved={() => {}} />

      {/* Stat cards */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Flame}
            label="Avg hot flushes / day"
            value={avgHotFlushes7 || "—"}
            sub="Last 7 days"
            color="coral"
          />
          <StatCard
            icon={Moon}
            label="Avg sleep quality"
            value={avgSleep7 ? `${avgSleep7}/10` : "—"}
            sub="Last 7 days"
            color="teal"
          />
          <StatCard
            icon={Zap}
            label="Avg energy"
            value={avgEnergy7 ? `${avgEnergy7}/10` : "—"}
            sub="Last 7 days"
            color="amber"
          />
          <StatCard
            icon={Calendar}
            label="Day streak"
            value={streak ? `${streak} 🔥` : "—"}
            sub="Consecutive days"
            color="purple"
          />
        </div>
      )}

      {/* Weekly insight */}
      <WeeklyInsight logs={logs} />

      {/* Aha moment */}
      <AhaMoment logs={logs} />

      {/* Trend badge */}
      {last30.length >= 7 && (
        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 border border-gray-100 shadow-sm w-fit">
          {trend === "improving" && (
            <>
              <TrendingDown className="w-5 h-5 text-teal-500" />
              <p className="text-sm font-medium text-teal-700">Hot flushes trending down — great progress!</p>
            </>
          )}
          {trend === "worsening" && (
            <>
              <TrendingUp className="w-5 h-5 text-coral-500" />
              <p className="text-sm font-medium text-coral-700">Hot flushes trending up vs. last fortnight</p>
            </>
          )}
          {trend === "stable" && (
            <>
              <Minus className="w-5 h-5 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">Symptoms stable vs. last fortnight</p>
            </>
          )}
        </div>
      )}

      {/* Charts */}
      {last30.length >= 3 && (
        <div className="grid md:grid-cols-2 gap-5">
          <Card>
            <CardTitle className="mb-1">Hot Flushes & Night Sweats</CardTitle>
            <p className="text-xs text-gray-400 mb-4">Last 30 days</p>
            <HotFlushChart logs={last30} />
          </Card>
          <Card>
            <CardTitle className="mb-1">Sleep Quality</CardTitle>
            <p className="text-xs text-gray-400 mb-4">Last 30 days (score out of 10)</p>
            <SleepQualityChart logs={last30} />
          </Card>
        </div>
      )}

      {/* Trigger overview */}
      {last30.length >= 7 && (
        <Card>
          <CardTitle className="mb-1">Top Triggers (30 days)</CardTitle>
          <p className="text-xs text-gray-400 mb-4">Avg hot flushes on days with vs. without each trigger</p>
          <TriggerChart logs={last30} />
          {triggers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {triggers.filter((t) => t.impact > 0).map((t) => (
                <span
                  key={t.key}
                  className="inline-flex items-center gap-1 bg-coral-50 text-coral-700 text-xs font-medium px-3 py-1 rounded-full"
                >
                  ⚠ {t.trigger}: +{t.impact} flushes
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Dr Tip */}
      <DrTip />

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/log", label: "Daily Log", emoji: "📋" },
          { href: "/insights", label: "Full Insights", emoji: "📊" },
          { href: "/doctor-report", label: "Doctor Report", emoji: "🩺" },
          { href: "/treatments", label: "Treatments", emoji: "💊" },
        ].map(({ href, label, emoji }) => (
          <Link
            key={href}
            href={href}
            className="card text-center hover:shadow-md transition-shadow cursor-pointer group"
          >
            <span className="text-2xl mb-2 block">{emoji}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {last30.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🌙</p>
          <h3 className="font-semibold text-lg text-[#1B1A44] mb-2">Start your tracking journey</h3>
          <p className="text-gray-500 text-sm mb-5">
            Log your first day to begin seeing patterns and insights.
          </p>
          <Link href="/log">
            <Button>Log Today&apos;s Symptoms</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-64 bg-gray-200 rounded-2xl" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
