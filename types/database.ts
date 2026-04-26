export type SubscriptionStatus = 'trial' | 'paid' | 'expired';
export type Mood = 'great' | 'good' | 'okay' | 'poor' | 'terrible';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
  has_paid: boolean;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  hot_flushes_count: number;
  night_sweats_count: number;
  sleep_quality: number | null;
  sleep_hours: number | null;
  mood: Mood | null;
  energy_level: number | null;
  brain_fog: boolean;
  joint_pain_level: number;
  period_today: boolean;
  alcohol_consumed: boolean;
  caffeine_after_2pm: boolean;
  spicy_food: boolean;
  high_stress: boolean;
  exercise: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  user_id: string;
  treatment_name: string;
  dose: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplement {
  id: string;
  user_id: string;
  supplement_name: string;
  dose: string | null;
  time_of_day: string | null;
  start_date: string;
  is_active: boolean;
  effectiveness_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DailyLogInsert = Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>;
export type DailyLogUpdate = Partial<DailyLogInsert>;
export type TreatmentInsert = Omit<Treatment, 'id' | 'created_at' | 'updated_at'>;
export type SupplementInsert = Omit<Supplement, 'id' | 'created_at' | 'updated_at'>;
