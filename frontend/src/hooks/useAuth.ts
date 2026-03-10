import { useState, useEffect, useCallback } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
}

const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@volta.build',
  app_metadata: {},
  user_metadata: { full_name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User;

const DEMO_PROFILE: UserProfile = {
  id: 'demo-user',
  email: 'demo@volta.build',
  plan: 'free',
  generations_today: 0,
  last_reset: new Date().toISOString(),
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isDemo: false,
  });

  const fetchProfile = useCallback(async (userId: string, token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json() as { profile: UserProfile };
        setState((prev) => ({ ...prev, profile: data.profile }));
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
      }));
      if (session?.user) {
        fetchProfile(session.user.id, session.access_token);
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
        profile: session ? prev.profile : null,
      }));
      if (session?.user) {
        fetchProfile(session.user.id, session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signInAsDemo = useCallback(() => {
    setState({ user: DEMO_USER, session: null, profile: DEMO_PROFILE, loading: false, isDemo: true });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, profile: null, loading: false, isDemo: false });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (state.isDemo) return;
    if (state.session) {
      await fetchProfile(state.session.user.id, state.session.access_token);
    }
  }, [state.session, state.isDemo, fetchProfile]);

  return {
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated: !!state.user,
    isPro: state.profile?.plan === 'pro',
    isDemo: state.isDemo,
    token: state.session?.access_token,
    signIn,
    signUp,
    signInWithGoogle,
    signInAsDemo,
    signOut,
    refreshProfile,
  };
}
