"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { identifyTriggers } from "@/lib/utils";
import type { DailyLog } from "@/types/database";

interface Props {
  logs: DailyLog[];
}

export default function TriggerChart({ logs }: Props) {
  const triggers = identifyTriggers(logs);

  if (!logs.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data yet. Log at least a week of data to see trigger analysis.
      </div>
    );
  }

  const data = triggers.map((t) => ({
    name: t.trigger.replace("Consumed", "").replace(" After 2Pm", "").trim(),
    "With trigger": t.avgWith,
    "Without trigger": t.avgWithout,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          label={{ value: "Avg hot flushes", angle: -90, position: "insideLeft", fontSize: 10, fill: "#9ca3af" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="With trigger" fill="#E87461" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Without trigger" fill="#4A9B9B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
