import type { UserProfile, DailyLog } from "@/types/database";

export const DEMO_EMAIL = "demo@family.test";
export const DEMO_PASSWORD = "Demo1234!";
export const DEMO_MODE_KEY = "pause_demo_mode";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
}

export function setDemoMode(on: boolean) {
  if (on) {
    localStorage.setItem(DEMO_MODE_KEY, "true");
  } else {
    localStorage.removeItem(DEMO_MODE_KEY);
  }
}

export const DEMO_USER: UserProfile = {
  id: "demo-user-id",
  email: DEMO_EMAIL,
  full_name: "Sarah Mitchell",
  date_of_birth: "1974-03-12",
  has_paid: true,
  subscription_status: "paid",
  stripe_customer_id: null,
  stripe_payment_intent_id: null,
  paid_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

// Generate 30 days of realistic data ending yesterday
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// Correct field names per DailyLog type:
//   night_sweats_count (number), mood (Mood enum), joint_pain_level (number),
//   period_today, alcohol_consumed, caffeine_after_2pm, high_stress, exercise (string|null)
export const DEMO_LOGS: DailyLog[] = [
  { id: "d30", user_id: "demo-user-id", log_date: daysAgo(30), hot_flushes_count: 7, night_sweats_count: 2, sleep_quality: 4, sleep_hours: 5.5, mood: "poor",    energy_level: 4, brain_fog: true,  joint_pain_level: 2, period_today: false, alcohol_consumed: true,  caffeine_after_2pm: true,  spicy_food: true,  high_stress: true,  exercise: null,       notes: "Rough night, multiple sweats",           created_at: "", updated_at: "" },
  { id: "d29", user_id: "demo-user-id", log_date: daysAgo(29), hot_flushes_count: 6, night_sweats_count: 1, sleep_quality: 5, sleep_hours: 6,   mood: "okay",    energy_level: 4, brain_fog: true,  joint_pain_level: 1, period_today: false, alcohol_consumed: false, caffeine_after_2pm: true,  spicy_food: false, high_stress: false, exercise: "Walk 20m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d28", user_id: "demo-user-id", log_date: daysAgo(28), hot_flushes_count: 8, night_sweats_count: 3, sleep_quality: 3, sleep_hours: 5,   mood: "poor",    energy_level: 3, brain_fog: true,  joint_pain_level: 3, period_today: false, alcohol_consumed: true,  caffeine_after_2pm: true,  spicy_food: true,  high_stress: true,  exercise: null,       notes: "Thai food for dinner — very bad night",  created_at: "", updated_at: "" },
  { id: "d27", user_id: "demo-user-id", log_date: daysAgo(27), hot_flushes_count: 5, night_sweats_count: 0, sleep_quality: 6, sleep_hours: 6.5, mood: "good",    energy_level: 5, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 30m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d26", user_id: "demo-user-id", log_date: daysAgo(26), hot_flushes_count: 4, night_sweats_count: 0, sleep_quality: 6, sleep_hours: 7,   mood: "good",    energy_level: 6, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 45m",  notes: "Good walk in the morning",               created_at: "", updated_at: "" },
  { id: "d25", user_id: "demo-user-id", log_date: daysAgo(25), hot_flushes_count: 7, night_sweats_count: 2, sleep_quality: 4, sleep_hours: 5.5, mood: "poor",    energy_level: 3, brain_fog: true,  joint_pain_level: 1, period_today: false, alcohol_consumed: true,  caffeine_after_2pm: false, spicy_food: false, high_stress: true,  exercise: null,       notes: "Wine at dinner — noticed correlation?",  created_at: "", updated_at: "" },
  { id: "d24", user_id: "demo-user-id", log_date: daysAgo(24), hot_flushes_count: 6, night_sweats_count: 2, sleep_quality: 4, sleep_hours: 6,   mood: "poor",    energy_level: 4, brain_fog: true,  joint_pain_level: 2, period_today: false, alcohol_consumed: false, caffeine_after_2pm: true,  spicy_food: false, high_stress: false, exercise: null,       notes: "",                                       created_at: "", updated_at: "" },
  { id: "d23", user_id: "demo-user-id", log_date: daysAgo(23), hot_flushes_count: 3, night_sweats_count: 0, sleep_quality: 7, sleep_hours: 7.5, mood: "good",    energy_level: 7, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Yoga 60m",  notes: "Yoga class — best sleep in weeks!",      created_at: "", updated_at: "" },
  { id: "d22", user_id: "demo-user-id", log_date: daysAgo(22), hot_flushes_count: 4, night_sweats_count: 0, sleep_quality: 7, sleep_hours: 7,   mood: "good",    energy_level: 6, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 30m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d21", user_id: "demo-user-id", log_date: daysAgo(21), hot_flushes_count: 5, night_sweats_count: 1, sleep_quality: 5, sleep_hours: 6,   mood: "okay",    energy_level: 5, brain_fog: true,  joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: true,  high_stress: false, exercise: null,       notes: "Curry at work lunch",                    created_at: "", updated_at: "" },
  { id: "d20", user_id: "demo-user-id", log_date: daysAgo(20), hot_flushes_count: 4, night_sweats_count: 0, sleep_quality: 6, sleep_hours: 6.5, mood: "good",    energy_level: 6, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 20m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d19", user_id: "demo-user-id", log_date: daysAgo(19), hot_flushes_count: 6, night_sweats_count: 2, sleep_quality: 4, sleep_hours: 5.5, mood: "poor",    energy_level: 4, brain_fog: true,  joint_pain_level: 1, period_today: false, alcohol_consumed: true,  caffeine_after_2pm: true,  spicy_food: false, high_stress: true,  exercise: null,       notes: "Stressful day at work",                  created_at: "", updated_at: "" },
  { id: "d18", user_id: "demo-user-id", log_date: daysAgo(18), hot_flushes_count: 3, night_sweats_count: 0, sleep_quality: 7, sleep_hours: 7.5, mood: "good",    energy_level: 7, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Swim 45m",  notes: "Swimming — felt great all day",          created_at: "", updated_at: "" },
  { id: "d17", user_id: "demo-user-id", log_date: daysAgo(17), hot_flushes_count: 3, night_sweats_count: 0, sleep_quality: 7, sleep_hours: 7,   mood: "good",    energy_level: 7, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 30m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d16", user_id: "demo-user-id", log_date: daysAgo(16), hot_flushes_count: 2, night_sweats_count: 0, sleep_quality: 8, sleep_hours: 8,   mood: "great",   energy_level: 8, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Run 60m",   notes: "Best day this month!",                   created_at: "", updated_at: "" },
  { id: "d15", user_id: "demo-user-id", log_date: daysAgo(15), hot_flushes_count: 4, night_sweats_count: 1, sleep_quality: 5, sleep_hours: 6,   mood: "okay",    energy_level: 5, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: true,  caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 20m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d14", user_id: "demo-user-id", log_date: daysAgo(14), hot_flushes_count: 3, night_sweats_count: 0, sleep_quality: 7, sleep_hours: 7.5, mood: "good",    energy_level: 7, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Yoga 40m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d13", user_id: "demo-user-id", log_date: daysAgo(13), hot_flushes_count: 4, night_sweats_count: 0, sleep_quality: 6, sleep_hours: 7,   mood: "good",    energy_level: 6, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 30m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d12", user_id: "demo-user-id", log_date: daysAgo(12), hot_flushes_count: 5, night_sweats_count: 1, sleep_quality: 5, sleep_hours: 6,   mood: "okay",    energy_level: 5, brain_fog: true,  joint_pain_level: 1, period_today: false, alcohol_consumed: true,  caffeine_after_2pm: false, spicy_food: true,  high_stress: false, exercise: null,       notes: "",                                       created_at: "", updated_at: "" },
  { id: "d11", user_id: "demo-user-id", log_date: daysAgo(11), hot_flushes_count: 2, night_sweats_count: 0, sleep_quality: 8, sleep_hours: 8,   mood: "great",   energy_level: 8, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Pilates",   notes: "Pilates + early night",                  created_at: "", updated_at: "" },
  { id: "d10", user_id: "demo-user-id", log_date: daysAgo(10), hot_flushes_count: 3, night_sweats_count: 0, sleep_quality: 7, sleep_hours: 7.5, mood: "good",    energy_level: 7, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 45m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d9",  user_id: "demo-user-id", log_date: daysAgo(9),  hot_flushes_count: 3, night_sweats_count: 0, sleep_quality: 7, sleep_hours: 7,   mood: "good",    energy_level: 7, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 30m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d8",  user_id: "demo-user-id", log_date: daysAgo(8),  hot_flushes_count: 4, night_sweats_count: 1, sleep_quality: 6, sleep_hours: 6.5, mood: "good",    energy_level: 5, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: true,  caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 20m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d7",  user_id: "demo-user-id", log_date: daysAgo(7),  hot_flushes_count: 2, night_sweats_count: 0, sleep_quality: 8, sleep_hours: 8,   mood: "great",   energy_level: 8, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Run 60m",   notes: "Feeling really good this week",          created_at: "", updated_at: "" },
  { id: "d6",  user_id: "demo-user-id", log_date: daysAgo(6),  hot_flushes_count: 2, night_sweats_count: 0, sleep_quality: 8, sleep_hours: 7.5, mood: "great",   energy_level: 8, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Yoga 45m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d5",  user_id: "demo-user-id", log_date: daysAgo(5),  hot_flushes_count: 3, night_sweats_count: 0, sleep_quality: 7, sleep_hours: 7,   mood: "good",    energy_level: 7, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 30m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d4",  user_id: "demo-user-id", log_date: daysAgo(4),  hot_flushes_count: 4, night_sweats_count: 0, sleep_quality: 6, sleep_hours: 7,   mood: "good",    energy_level: 7, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Yoga 40m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d3",  user_id: "demo-user-id", log_date: daysAgo(3),  hot_flushes_count: 2, night_sweats_count: 0, sleep_quality: 8, sleep_hours: 8,   mood: "great",   energy_level: 8, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Run 60m",   notes: "Week 3 — symptoms much better",          created_at: "", updated_at: "" },
  { id: "d2",  user_id: "demo-user-id", log_date: daysAgo(2),  hot_flushes_count: 3, night_sweats_count: 0, sleep_quality: 7, sleep_hours: 7.5, mood: "good",    energy_level: 7, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Walk 30m",  notes: "",                                       created_at: "", updated_at: "" },
  { id: "d1",  user_id: "demo-user-id", log_date: daysAgo(1),  hot_flushes_count: 2, night_sweats_count: 0, sleep_quality: 8, sleep_hours: 8,   mood: "great",   energy_level: 8, brain_fog: false, joint_pain_level: 0, period_today: false, alcohol_consumed: false, caffeine_after_2pm: false, spicy_food: false, high_stress: false, exercise: "Swim 45m",  notes: "Feeling the best I have in months",      created_at: "", updated_at: "" },
];
