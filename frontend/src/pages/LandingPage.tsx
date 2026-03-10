import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PROMPTS = [
  'A portfolio for a freelance photographer',
  'A landing page for a SaaS startup',
  'A restaurant website with a menu and reservations',
];

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant generation',
    desc: 'Describe your site in plain English. Get production-ready HTML, CSS, and JS in seconds — no templates, no drag-and-drop.',
    badge: null,
  },
  {
    icon: '💬',
    title: 'Chat refinement',
    desc: 'Not quite right? Chat with the AI to tweak colors, layout, copy, and more. Iterate until it\'s perfect.',
    badge: 'Pro',
  },
  {
    icon: '📦',
    title: 'Export React',
    desc: 'Download your site as a ready-to-run React + Vite project with Tailwind CSS configured.',
    badge: 'Pro',
  },
];

export function LandingPage() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPromptIndex((i) => (i + 1) % PROMPTS.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-volta-midnight text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight text-white">
          Volta<span className="text-volta-electric">.</span>
        </span>
        <Link
          to="/app"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-volta-electric/10 border border-volta-electric/30 text-volta-electric hover:bg-volta-electric hover:text-white transition-all"
        >
          Get started free
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Build websites with{' '}
          <span className="text-volta-electric">one sentence</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
          Describe what you want. Volta generates production-ready HTML, CSS & JS
          in seconds — no code, no templates, no friction.
        </p>

        {/* Animated prompt */}
        <div className="mb-10 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4 max-w-lg mx-auto">
          <svg className="w-4 h-4 text-volta-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p
            className="text-sm text-slate-300 text-left transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            "{PROMPTS[promptIndex]}"
          </p>
        </div>

        <Link
          to="/app"
          className="inline-flex items-center gap-2 bg-volta-electric hover:bg-volta-electric/90 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-volta-electric/20 hover:shadow-volta-electric/40"
        >
          Start building free
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="mt-3 text-xs text-slate-500">No credit card required</p>
      </section>

      {/* Demo strip */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Portfolio', bg: 'from-violet-900/40 to-indigo-900/40', icon: '🎨' },
            { label: 'SaaS Landing', bg: 'from-blue-900/40 to-cyan-900/40', icon: '🚀' },
            { label: 'Restaurant', bg: 'from-orange-900/40 to-red-900/40', icon: '🍽️' },
          ].map(({ label, bg, icon }) => (
            <div
              key={label}
              className={`rounded-xl border border-white/10 bg-gradient-to-br ${bg} p-6 h-40 flex flex-col justify-between`}
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-sm font-medium text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc, badge }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{icon}</span>
                <span className="font-semibold text-white">{title}</span>
                {badge && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-volta-electric text-white px-1.5 py-0.5 rounded">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Simple pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <p className="text-sm text-slate-400 font-medium mb-1">Free</p>
            <p className="text-4xl font-bold mb-6">$0</p>
            <ul className="space-y-3 text-sm text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-volta-energy">✓</span> 5 generations per day
              </li>
              <li className="flex items-center gap-2">
                <span className="text-volta-energy">✓</span> HTML/CSS/JS export
              </li>
              <li className="flex items-center gap-2">
                <span className="text-volta-energy">✓</span> Live preview
              </li>
            </ul>
            <Link
              to="/app"
              className="block text-center w-full py-3 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Get started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-volta-electric/10 border border-volta-electric/40 rounded-xl p-8 relative">
            <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide bg-volta-electric text-white px-2 py-1 rounded">
              Popular
            </span>
            <p className="text-sm text-volta-electric font-medium mb-1">Pro</p>
            <p className="text-4xl font-bold mb-6">$19<span className="text-lg font-normal text-slate-400">/mo</span></p>
            <ul className="space-y-3 text-sm text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-volta-energy">✓</span> Unlimited generations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-volta-energy">✓</span> Chat refinement
              </li>
              <li className="flex items-center gap-2">
                <span className="text-volta-energy">✓</span> Export as React + Vite
              </li>
              <li className="flex items-center gap-2">
                <span className="text-volta-energy">✓</span> Priority support
              </li>
            </ul>
            <Link
              to="/app"
              className="block text-center w-full py-3 rounded-lg bg-volta-electric text-sm font-semibold hover:bg-volta-electric/90 transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <span>Volta © 2025</span>
          <Link to="/app" className="hover:text-slate-300 transition-colors">
            Open app →
          </Link>
        </div>
      </footer>
    </div>
  );
}
