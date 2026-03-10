import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';
import { StylePanel, StyleOptions, DEFAULT_STYLE, buildStyleSuffix } from './StylePanel';

const TEMPLATES = [
  { label: 'SaaS Landing', icon: '🚀', prompt: 'A SaaS landing page for a project management tool. Hero with animated gradient, features grid, pricing table (3 tiers), and CTA. Dark mode, modern design.' },
  { label: 'Portfolio', icon: '✦', prompt: 'A personal portfolio for a UX/product designer. Minimal layout, case studies grid, about section with photo placeholder, and contact form. Clean typography.' },
  { label: 'Startup', icon: '⚡', prompt: 'A startup landing page for an AI writing tool. Bold typography, product demo screenshot area, testimonials carousel, features list, and pricing. Modern and confident.' },
  { label: 'E-commerce', icon: '🛍️', prompt: 'An e-commerce landing for a premium skincare brand. Product hero section, bestsellers grid, ingredients story, customer reviews, and newsletter signup. Luxury aesthetic.' },
  { label: 'Blog', icon: '✍️', prompt: 'A minimal blog for a tech writer. Clean reading layout, featured post hero, article cards grid, newsletter form, and author bio sidebar.' },
  { label: 'Agency', icon: '◈', prompt: 'A creative digital agency website. Bold agency name hero, services list, work showcase grid, team section, and contact form. Confident and design-forward.' },
  { label: 'Dashboard', icon: '▦', prompt: 'A SaaS analytics dashboard landing page. Shows metrics preview, feature list, integration logos, pricing FAQ, and testimonials. B2B focused.' },
  { label: 'Restaurant', icon: '🍽️', prompt: 'A restaurant landing page. Atmospheric hero with food photography placeholders, menu highlights, reservations form, location, and opening hours. Warm and inviting.' },
];

const PLACEHOLDER_PROMPTS = [
  'A portfolio for a freelance photographer with a dark, editorial aesthetic...',
  'A landing page for a fintech startup. Bold hero, dashboard preview, 3-tier pricing...',
  'An e-commerce page for a specialty coffee brand. Warm tones, product showcase...',
  'A personal blog with clean typography, featured article hero, and newsletter signup...',
  'A SaaS landing page with animated gradient hero, features grid, and testimonials...',
];

const CHAR_LIMIT = 500;

interface GeneratorPanelProps {
  onGenerate: (prompt: string, styleOptions: StyleOptions) => void;
  onEnhance: (prompt: string) => Promise<string | null>;
  isGenerating: boolean;
  hasResult: boolean;
  generationsToday?: number;
  isPro?: boolean;
  onUpgradeClick: () => void;
}

export function GeneratorPanel({
  onGenerate,
  onEnhance,
  isGenerating,
  hasResult,
  generationsToday = 0,
  isPro = false,
  onUpgradeClick,
}: GeneratorPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showStyle, setShowStyle] = useState(false);
  const [styleOptions, setStyleOptions] = useState<StyleOptions>(DEFAULT_STYLE);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_PROMPTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt, styleOptions);
  }, [prompt, isGenerating, onGenerate, styleOptions]);

  const handleEnhance = useCallback(async () => {
    if (!prompt.trim() || isEnhancing) return;
    if (!isPro) { onUpgradeClick(); return; }
    setIsEnhancing(true);
    const enhanced = await onEnhance(prompt);
    if (enhanced) setPrompt(enhanced);
    setIsEnhancing(false);
  }, [prompt, isEnhancing, isPro, onEnhance, onUpgradeClick]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  const charPercent = Math.min((prompt.length / CHAR_LIMIT) * 100, 100);
  const isOverLimit = prompt.length > CHAR_LIMIT;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-volta-midnight mb-2 leading-[1.1] font-display">
          Transform ideas
          <br />
          <span className="gradient-text">into websites</span>
        </h2>
        <p className="text-base text-volta-slate-600">
          Describe your site — Claude builds it in seconds
        </p>
      </div>

      {/* Templates */}
      <div className="mb-4">
        <p className="text-xs font-medium text-volta-slate-500 mb-2 uppercase tracking-wide">Quick templates</p>
        <div className="grid grid-cols-4 gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => { setPrompt(t.prompt); textareaRef.current?.focus(); }}
              className="text-left px-2 py-1.5 rounded-lg border border-volta-slate-200 hover:border-volta-electric/50 hover:bg-volta-electric/5 transition-all group"
            >
              <span className="text-sm">{t.icon}</span>
              <span className="block text-xs font-medium text-volta-slate-700 group-hover:text-volta-electric transition-colors leading-tight">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 flex flex-col min-h-[180px]">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_PROMPTS[placeholderIndex]}
            className={`flex-1 w-full p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all font-normal text-base leading-relaxed text-volta-midnight placeholder-volta-slate-300 ${
              isOverLimit
                ? 'border-red-300 focus:ring-red-200'
                : 'border-volta-slate-200 focus:ring-volta-electric/30 focus:border-volta-electric'
            }`}
            disabled={isGenerating}
          />

          {/* Bottom row inside textarea */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {/* Enhance button */}
            <button
              onClick={handleEnhance}
              disabled={!prompt.trim() || isGenerating || isEnhancing}
              title={isPro ? 'Enhance prompt with AI' : 'Enhance prompt (Pro)'}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-volta-electric/40 text-volta-electric hover:bg-volta-electric/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isEnhancing ? (
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
              Enhance
              {!isPro && <span className="text-[9px] font-bold bg-volta-electric text-white px-1 py-0.5 rounded">Pro</span>}
            </button>

            <div className={`text-xs font-mono ${isOverLimit ? 'text-red-500' : 'text-volta-slate-400'}`}>
              {prompt.length}/{CHAR_LIMIT}
            </div>
            <div className="w-8 h-1 rounded-full bg-volta-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOverLimit ? 'bg-red-400' : charPercent > 80 ? 'bg-yellow-400' : 'bg-volta-electric'}`}
                style={{ width: `${charPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Customize style toggle */}
        <button
          onClick={() => setShowStyle((s) => !s)}
          className="mt-2 flex items-center gap-1.5 text-xs text-volta-slate-500 hover:text-volta-electric transition-colors self-start"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${showStyle ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showStyle ? 'Hide style options' : 'Customize style →'}
          {(styleOptions.logoBase64 || styleOptions.references.length > 0) && (
            <span className="w-1.5 h-1.5 rounded-full bg-volta-electric" />
          )}
        </button>

        {showStyle && (
          <StylePanel options={styleOptions} onChange={setStyleOptions} />
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || isOverLimit}
          className="mt-4 w-full bg-volta-electric text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shimmer glow-pulse"
        >
          <span className="flex items-center justify-center gap-2">
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating your website...
              </>
            ) : hasResult ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate website
              </>
            )}
          </span>
        </button>

        <p className="text-center text-xs text-volta-slate-400 mt-2">
          Press <kbd className="bg-volta-slate-100 text-volta-slate-600 px-1.5 py-0.5 rounded text-xs font-mono">⌘ Enter</kbd> to generate
        </p>

        {/* Usage indicator */}
        {!isPro && (
          <div className="mt-3 flex items-center justify-between text-xs text-volta-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1 rounded-full bg-volta-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-volta-electric transition-all"
                  style={{ width: `${Math.min((generationsToday / 5) * 100, 100)}%` }}
                />
              </div>
              <span>{generationsToday}/5 today</span>
            </div>
            <button onClick={onUpgradeClick} className="text-volta-electric font-medium hover:underline">
              Upgrade for unlimited →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
