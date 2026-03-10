import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isPro: boolean;
  token: string | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isDemo: false,
  });

  const fetchProfile = useCallback(async (token: string) => {
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, user: session?.user ?? null, session, loading: false }));
      if (session) fetchProfile(session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
        profile: session ? prev.profile : null,
        isDemo: false,
      }));
      if (session) fetchProfile(session.access_token);
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
    if (state.isDemo || !state.session) return;
    await fetchProfile(state.session.access_token);
  }, [state.isDemo, state.session, fetchProfile]);

  return (
    <AuthContext.Provider value={{
      ...state,
      isAuthenticated: !!state.user,
      isPro: state.profile?.plan === 'pro',
      token: state.session?.access_token,
      signIn,
      signUp,
      signInWithGoogle,
      signInAsDemo,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
