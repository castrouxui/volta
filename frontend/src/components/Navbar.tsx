import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { openBillingPortal } from '../lib/stripe';

interface NavbarProps {
  onSignInClick: () => void;
  onPricingClick: () => void;
}

export function Navbar({ onSignInClick, onPricingClick }: NavbarProps) {
  const { user, profile, isPro, signOut, token } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handlePortal = async () => {
    if (!token) return;
    try {
      await openBillingPortal(token);
    } catch {
      // silently fail
    }
  };

  return (
    <nav className="bg-white border-b border-volta-slate-200 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-volta-electric rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M9 1L3 9h5l-1 6 7-9H9L10 1z" fill="white" strokeWidth="0.5" stroke="white"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-volta-midnight font-display">
              VOLTA
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={onPricingClick}
              className="text-sm text-volta-slate-600 hover:text-volta-midnight transition-colors"
            >
              Pricing
            </button>
            <a
              href="#templates"
              className="text-sm text-volta-slate-600 hover:text-volta-midnight transition-colors"
            >
              Templates
            </a>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-volta-midnight hover:text-volta-electric transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-volta-electric/10 flex items-center justify-center text-volta-electric font-semibold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  {isPro && (
                    <span className="bg-gradient-to-r from-volta-electric to-volta-spark text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                  <svg className="w-4 h-4 text-volta-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-volta-slate-200 shadow-lg py-1 animate-slideUp">
                    <div className="px-4 py-2 border-b border-volta-slate-100">
                      <p className="text-xs text-volta-slate-500">Signed in as</p>
                      <p className="text-sm font-medium text-volta-midnight truncate">{user.email}</p>
                      {profile && (
                        <p className="text-xs text-volta-slate-500 mt-0.5">
                          {isPro ? 'Pro plan' : `Free — ${profile.generations_today}/5 today`}
                        </p>
                      )}
                    </div>
                    {isPro ? (
                      <button
                        onClick={handlePortal}
                        className="w-full text-left px-4 py-2 text-sm text-volta-slate-700 hover:bg-volta-slate-50 transition-colors"
                      >
                        Manage subscription
                      </button>
                    ) : (
                      <button
                        onClick={() => { setMenuOpen(false); onPricingClick(); }}
                        className="w-full text-left px-4 py-2 text-sm text-volta-electric font-medium hover:bg-volta-slate-50 transition-colors"
                      >
                        Upgrade to Pro ✨
                      </button>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="w-full text-left px-4 py-2 text-sm text-volta-slate-600 hover:bg-volta-slate-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onSignInClick}
                  className="text-sm font-medium text-volta-midnight hover:text-volta-electric transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={onSignInClick}
                  className="text-sm font-medium bg-volta-electric text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get started free
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close menu on outside click */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
}
