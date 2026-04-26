"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode, DEMO_LOGS } from "@/lib/demo-data";
import type { DailyLog, DailyLogInsert } from "@/types/database";
import { today } from "@/lib/utils";

export function useLogs() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);

    if (isDemoMode()) {
      setLogs(DEMO_LOGS);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setLogs(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function saveLog(logData: Omit<DailyLogInsert, "user_id">) {
    if (isDemoMode()) {
      // In demo mode, just update local state optimistically
      const existing = logs.findIndex((l) => l.log_date === logData.log_date);
      const newLog: DailyLog = {
        ...logData,
        id: `demo-${Date.now()}`,
        user_id: "demo-user-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as DailyLog;
      if (existing >= 0) {
        const updated = [...logs];
        updated[existing] = { ...updated[existing], ...newLog };
        setLogs(updated);
      } else {
        setLogs([newLog, ...logs]);
      }
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const existing = logs.find((l) => l.log_date === logData.log_date);

    if (existing) {
      const { error } = await supabase
        .from("daily_logs")
        .update(logData)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("daily_logs")
        .insert({ ...logData, user_id: user.id });
      if (error) throw error;
    }

    await fetchLogs();
  }

  async function deleteLog(id: string) {
    if (isDemoMode()) {
      setLogs(logs.filter((l) => l.id !== id));
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("daily_logs").delete().eq("id", id);
    if (error) throw error;
    await fetchLogs();
  }

  const getLogForDate = useCallback((date: string) => {
    return logs.find((l) => l.log_date === date) ?? null;
  }, [logs]);

  const todayLog = getLogForDate(today());

  return { logs, loading, error, saveLog, deleteLog, getLogForDate, todayLog, refetch: fetchLogs };
}
