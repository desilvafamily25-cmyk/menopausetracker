"use client";

import {
  LineChart,
  Line,
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

export default function HotFlushChart({ logs }: Props) {
  const data = [...logs]
    .sort((a, b) => a.log_date.localeCompare(b.log_date))
    .slice(-30)
    .map((l) => ({
      date: format(parseISO(l.log_date), "dd MMM"),
      hotFlushes: l.hot_flushes_count,
      nightSweats: l.night_sweats_count,
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
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="hotFlushes"
          stroke="#8B7BA8"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          name="Hot Flushes"
        />
        <Line
          type="monotone"
          dataKey="nightSweats"
          stroke="#4A9B9B"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="Night Sweats"
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
