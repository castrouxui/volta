import { useState } from 'react';
import { createCheckout } from '../lib/stripe';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  onSignInRequired: () => void;
}

const FREE_FEATURES = [
  '5 generations per day',
  'HTML + CSS export',
  'Preview in browser',
  'Copy & download',
];

const PRO_FEATURES = [
  'Unlimited generations',
  'Chat refinement',
  'Generation history',
  'Export React components',
  'Priority AI model',
  'Early access to new features',
];

export function PricingModal({ isOpen, onClose, token, onSignInRequired }: PricingModalProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!token) {
      onClose();
      onSignInRequired();
      return;
    }

    setLoading(true);
    try {
      await createCheckout(billing === 'monthly' ? 'pro_monthly' : 'pro_yearly', token);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-volta-midnight/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-slideUp overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-volta-slate-400 hover:text-volta-midnight hover:bg-volta-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <p className="text-xs font-semibold text-volta-electric uppercase tracking-widest mb-2">Pricing</p>
          <h2 className="text-3xl font-bold text-volta-midnight font-display">
            Build faster with Pro
          </h2>
          <p className="text-volta-slate-600 mt-2 text-sm">
            Unlimited generations, refinement, history — everything you need.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-volta-slate-100 rounded-full p-1 mt-5">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-volta-midnight shadow-sm'
                  : 'text-volta-slate-500 hover:text-volta-midnight'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                billing === 'yearly'
                  ? 'bg-white text-volta-midnight shadow-sm'
                  : 'text-volta-slate-500 hover:text-volta-midnight'
              }`}
            >
              Yearly
              <span className="text-xs font-bold text-volta-energy bg-volta-energy/10 px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="px-8 pb-8 grid grid-cols-2 gap-4">
          {/* Free */}
          <div className="border border-volta-slate-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-volta-slate-600 mb-1">Free</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-volta-midnight">$0</span>
              <span className="text-volta-slate-500 text-sm">/month</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-volta-slate-600">
                  <svg className="w-4 h-4 text-volta-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium border border-volta-slate-300 text-volta-slate-700 rounded-lg hover:bg-volta-slate-50 transition-colors"
            >
              Continue free
            </button>
          </div>

          {/* Pro */}
          <div className="border-2 border-volta-electric rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-volta-electric text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <p className="text-sm font-semibold text-volta-electric mb-1">Pro</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-volta-midnight">
                ${billing === 'monthly' ? '19' : '15'}
              </span>
              <span className="text-volta-slate-500 text-sm">/month</span>
            </div>
            {billing === 'yearly' && (
              <p className="text-xs text-volta-energy font-medium -mt-3 mb-3">$180/year — save $48</p>
            )}
            <ul className="space-y-2.5 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-volta-slate-700">
                  <svg className="w-4 h-4 text-volta-electric flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold bg-volta-electric text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Upgrade to Pro'
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-volta-slate-400 pb-6">
          Cancel anytime · Secure payment via Stripe
        </p>
      </div>
    </div>
  );
}
