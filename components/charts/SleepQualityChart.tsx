"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { DailyLog } from "@/types/database";

interface Props {
  logs: DailyLog[];
}

export default function SleepQualityChart({ logs }: Props) {
  const data = [...logs]
    .sort((a, b) => a.log_date.localeCompare(b.log_date))
    .slice(-30)
    .map((l) => ({
      date: format(parseISO(l.log_date), "dd MMM"),
      quality: l.sleep_quality ?? 0,
      hours: l.sleep_hours ?? 0,
    }));

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data yet. Start logging to see your chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4A9B9B" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#4A9B9B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          domain={[0, 10]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="quality"
          stroke="#4A9B9B"
          strokeWidth={2.5}
          fill="url(#sleepGradient)"
          name="Sleep Quality (1–10)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
