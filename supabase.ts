import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  generations_today: number;
  last_reset: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function resetDailyGenerationsIfNeeded(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const profile = await getUserProfile(userId);
  if (!profile) return;

  if (profile.last_reset !== today) {
    await supabase
      .from('profiles')
      .update({ generations_today: 0, last_reset: today })
      .eq('id', userId);
  }
}

export async function incrementGenerationCount(userId: string): Promise<void> {
  await supabase.rpc('increment_generations', { user_id: userId });
}

export async function saveGeneration(
  userId: string,
  prompt: string,
  html: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('generations')
    .insert({ user_id: userId, prompt, html })
    .select('id')
    .single();

  if (error) return null;
  return data.id;
}

export async function getUserGenerations(userId: string) {
  const { data } = await supabase
    .from('generations')
    .select('id, prompt, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  return data || [];
}

export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'pro',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<void> {
  await supabase
    .from('profiles')
    .update({
      plan,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
    })
    .eq('id', userId);
}
