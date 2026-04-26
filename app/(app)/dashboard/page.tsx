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
  const colors = {
    purple: "bg-primary-50 text-primary-500",
    teal: "bg-teal-50 text-teal-500",
    coral: "bg-coral-50 text-coral-500",
    amber: "bg-amber-50 text-amber-500",
  };

  return (
    <Card className="flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1B1A44]">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
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
      {/* Welcome banner */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-primary-500 to-teal-500 rounded-2xl p-5 text-white flex items-center gap-4">
          <PartyPopper className="w-8 h-8 flex-shrink-0" />
          <div>
            <p className="font-semibold text-lg">Welcome to your tracker!</p>
            <p className="text-primary-100 text-sm">
              Start by logging today&apos;s symptoms. 30 days of data is all you need for a great doctor report.
            </p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="ml-auto text-white/70 hover:text-white text-xl leading-none">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">
            {user?.full_name ? `Hi, ${user.full_name.split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <p className="page-sub">{formatDate(today(), "EEEE, d MMMM yyyy")}</p>
        </div>
        {!hasTodayLog && (
          <Link href="/log">
            <Button size="sm" className="gap-2">
              Log Today <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

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
