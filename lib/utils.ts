import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays, subDays } from 'date-fns';
import type { DailyLog } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function today() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function calculateStreak(logs: DailyLog[]): number {
  if (!logs.length) return 0;
  const sorted = [...logs].sort(
    (a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
  );
  const todayStr = today();
  const mostRecent = sorted[0].log_date;
  const daysSinceLast = differenceInDays(
    new Date(todayStr),
    new Date(mostRecent)
  );
  if (daysSinceLast > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInDays(
      new Date(sorted[i - 1].log_date),
      new Date(sorted[i].log_date)
    );
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getLast30Days(logs: DailyLog[]) {
  const cutoff = subDays(new Date(), 30);
  return logs.filter((l) => new Date(l.log_date) >= cutoff);
}

export function getLast7Days(logs: DailyLog[]) {
  const cutoff = subDays(new Date(), 7);
  return logs.filter((l) => new Date(l.log_date) >= cutoff);
}

export function average(nums: (number | null | undefined)[]) {
  const valid = nums.filter((n): n is number => n != null);
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function moodToNumber(mood: string | null): number {
  const map: Record<string, number> = {
    great: 5, good: 4, okay: 3, poor: 2, terrible: 1,
  };
  return mood ? (map[mood] ?? 0) : 0;
}

export function identifyTriggers(logs: DailyLog[]) {
  const triggers = ['alcohol_consumed', 'caffeine_after_2pm', 'spicy_food', 'high_stress'] as const;
  const results = triggers.map((trigger) => {
    const withTrigger = logs.filter((l) => l[trigger]);
    const withoutTrigger = logs.filter((l) => !l[trigger]);
    const avgWith = average(withTrigger.map((l) => l.hot_flushes_count));
    const avgWithout = average(withoutTrigger.map((l) => l.hot_flushes_count));
    return {
      trigger: trigger.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      key: trigger,
      avgWith: Math.round(avgWith * 10) / 10,
      avgWithout: Math.round(avgWithout * 10) / 10,
      impact: Math.round((avgWith - avgWithout) * 10) / 10,
    };
  });
  return results.sort((a, b) => b.impact - a.impact);
}
