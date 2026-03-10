import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Plan = 'free' | 'pro';

export interface UserProfile {
  id: string;
  email: string;
  plan: Plan;
  generations_today: number;
  last_reset: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  avatar_url?: string;
}
