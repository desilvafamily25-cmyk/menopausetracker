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

export function getWeekComparison(logs: DailyLog[]) {
  const thisWeek = logs.filter((l) => new Date(l.log_date) >= subDays(new Date(), 7));
  const lastWeek = logs.filter((l) => {
    const d = new Date(l.log_date);
    return d >= subDays(new Date(), 14) && d < subDays(new Date(), 7);
  });
  const avgThis = average(thisWeek.map((l) => l.hot_flushes_count));
  const avgLast = average(lastWeek.map((l) => l.hot_flushes_count));
  const sleepThis = average(thisWeek.map((l) => l.sleep_quality));
  const sleepLast = average(lastWeek.map((l) => l.sleep_quality));
  return {
    flushesThis: Math.round(avgThis * 10) / 10,
    flushesLast: Math.round(avgLast * 10) / 10,
    flushesChange: Math.round((avgThis - avgLast) * 10) / 10,
    sleepThis: Math.round(sleepThis * 10) / 10,
    sleepLast: Math.round(sleepLast * 10) / 10,
    sleepChange: Math.round((sleepThis - sleepLast) * 10) / 10,
    hasData: thisWeek.length >= 3 && lastWeek.length >= 3,
  };
}

export function getMilestone(logs: DailyLog[]): { days: number; message: string } | null {
  const count = logs.length;
  if (count === 0) return null;
  if (count >= 90) return { days: 90, message: "90 days! Your data is now clinically meaningful." };
  if (count >= 60) return { days: 60, message: "60 days logged — you're building an incredible health record." };
  if (count >= 30) return { days: 30, message: "30 days! Your GP report is now highly accurate." };
  if (count >= 14) return { days: 14, message: "2 weeks of data — patterns are starting to emerge." };
  if (count >= 7)  return { days: 7,  message: "First week complete — great start!" };
  return null;
}

export function getTopInsight(logs: DailyLog[]): string | null {
  if (logs.length < 7) return null;
  const triggers = identifyTriggers(logs);
  const top = triggers.find((t) => t.impact >= 1 && t.avgWith > 0);
  if (!top) return null;
  const pct = top.avgWithout > 0
    ? Math.round(((top.avgWith - top.avgWithout) / top.avgWithout) * 100)
    : null;
  const label = top.trigger.toLowerCase();
  if (pct && pct > 0) {
    return `On days you have ${label}, you experience ${pct}% more hot flushes.`;
  }
  return `${top.trigger} appears to increase your hot flushes by ${top.impact} per day.`;
}

export const DR_TIPS = [
  { tip: "Layering clothing makes it easier to manage hot flushes in public — a light cardigan you can remove quickly is your best friend.", category: "Practical" },
  { tip: "Keeping a small fan at your bedside and a cool water spray can significantly reduce night sweat disruption.", category: "Sleep" },
  { tip: "Even 20 minutes of daily walking has been shown in studies to reduce hot flush frequency by up to 15%.", category: "Exercise" },
  { tip: "Alcohol — even one glass — can trigger hot flushes within hours. Try alcohol-free for 2 weeks and compare your data.", category: "Triggers" },
  { tip: "The gap between your last log and your GP appointment matters. 30 consecutive days of data is the gold standard.", category: "Tracking" },
  { tip: "Phytoestrogens in soy, flaxseed and chickpeas can mildly reduce symptoms for some women. Worth tracking if you add them.", category: "Nutrition" },
  { tip: "Cognitive Behavioural Therapy (CBT) is now NICE-recommended for menopause — it works even when you can't take HRT.", category: "Mental Health" },
  { tip: "Sleep quality matters more than hours. Going to bed and waking at the same time every day can improve your sleep score.", category: "Sleep" },
];

export function getTodaysTip() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DR_TIPS[dayOfYear % DR_TIPS.length];
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
