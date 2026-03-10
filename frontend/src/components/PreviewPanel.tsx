import { useState, useEffect, useRef } from 'react';

interface PreviewPanelProps {
  html: string;
  isGenerating: boolean;
  onDownload: () => void;
  onCopy: () => void;
  copySuccess: boolean;
  isPro: boolean;
  onExportReact: () => void;
  language: 'es' | 'en';
}

const STAGES_ES = [
  { icon: '🔍', text: 'Analizando tu prompt...' },
  { icon: '🎨', text: 'Diseñando el layout...' },
  { icon: '⚡', text: 'Escribiendo HTML & CSS...' },
  { icon: '✨', text: 'Agregando interacciones...' },
];

const STAGES_EN = [
  { icon: '🔍', text: 'Analyzing your prompt...' },
  { icon: '🎨', text: 'Designing the layout...' },
  { icon: '⚡', text: 'Writing HTML & CSS...' },
  { icon: '✨', text: 'Adding interactions...' },
];

const UI_PREVIEW = {
  es: {
    stageOf: (i: number, total: number) => `Paso ${i} de ${total}`,
    emptyTitle: 'Tu sitio web aparecerá acá',
    emptySubtitle: 'Describí tu sitio o elegí una plantilla →',
    preview: 'Vista previa',
    code: 'Código',
    copy: 'Copiar',
    copied: 'Copiado!',
    download: 'Descargar',
    generating: 'Generando...',
  },
  en: {
    stageOf: (i: number, total: number) => `Stage ${i} of ${total}`,
    emptyTitle: 'Your website will appear here',
    emptySubtitle: 'Describe your site or pick a template →',
    preview: 'Preview',
    code: 'Code',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    generating: 'Generating...',
  },
};

const DEMO_LINES = [
  { color: 'text-volta-electric', text: '<!DOCTYPE html>' },
  { color: 'text-slate-400', text: '<html lang="en">' },
  { color: 'text-volta-spark', text: '  <title>My Website</title>' },
  { color: 'text-volta-energy', text: '  <script src="tailwind.js"/>' },
  { color: 'text-slate-400', text: '  <body class="bg-gray-900">' },
  { color: 'text-volta-electric', text: '    <div class="hero">' },
  { color: 'text-volta-spark', text: '      <h1>Build faster ⚡</h1>' },
  { color: 'text-slate-400', text: '    </div>' },
];

function GeneratingState({ language }: { language: 'es' | 'en' }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const STAGES = language === 'es' ? STAGES_ES : STAGES_EN;
  const t = UI_PREVIEW[language];

  useEffect(() => {
    const timer = setInterval(() => setStageIndex((i) => Math.min(i + 1, STAGES.length - 1)), 3500);
    return () => clearInterval(timer);
  }, [STAGES.length]);

  useEffect(() => {
    const timer = setTimeout(
      () => visibleLines < DEMO_LINES.length
        ? setVisibleLines((v) => v + 1)
        : setVisibleLines(0),
      visibleLines < DEMO_LINES.length ? 280 : 1800
    );
    return () => clearTimeout(timer);
  }, [visibleLines]);

  const stage = STAGES[stageIndex];
  const progress = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 relative overflow-hidden">
      <div className="absolute top-6 right-6 w-48 h-48 bg-volta-electric/6 rounded-full blur-3xl float-slow pointer-events-none" />
      <div className="absolute bottom-8 left-6 w-32 h-32 bg-volta-spark/6 rounded-full blur-2xl float-medium pointer-events-none" />

      <div className="relative w-20 h-20 mb-5">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34" fill="none" stroke="#6366F1" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl">{stage.icon}</span>
      </div>

      <p className="text-sm font-semibold text-volta-midnight mb-1 text-center" key={stageIndex}>
        {stage.text}
      </p>
      <p className="text-xs text-volta-slate-400 mb-6">{t.stageOf(stageIndex + 1, STAGES.length)}</p>

      <div className="w-full max-w-xs bg-volta-midnight rounded-xl border border-white/10 overflow-hidden shadow-xl">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
          <span className="ml-2 text-[10px] text-white/30 font-mono">index.html</span>
        </div>
        <div className="p-3 font-mono text-[10px] leading-relaxed min-h-[90px]">
          {DEMO_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={`${line.color} code-line`}>{line.text}</div>
          ))}
          <span className="inline-block w-1.5 h-3 bg-volta-electric align-middle animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function AnimatedEmptyState({ language }: { language: 'es' | 'en' }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [loop, setLoop] = useState(false);
  const t = UI_PREVIEW[language];

  useEffect(() => {
    const timer = setTimeout(
      () => visibleLines < DEMO_LINES.length
        ? setVisibleLines((v) => v + 1)
        : (() => { setVisibleLines(0); setLoop((l) => !l); })(),
      visibleLines < DEMO_LINES.length ? 220 : 2200
    );
    return () => clearTimeout(timer);
  }, [visibleLines, loop]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 relative overflow-hidden">
      <div className="absolute top-8 right-8 w-40 h-40 bg-volta-electric/8 rounded-full blur-3xl float-slow pointer-events-none" />
      <div className="absolute bottom-12 left-8 w-32 h-32 bg-volta-spark/8 rounded-full blur-2xl float-medium pointer-events-none" />

      <div className="w-full max-w-sm bg-volta-midnight rounded-xl border border-white/10 overflow-hidden shadow-2xl mb-5 float-slow">
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 border-b border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          <span className="ml-2 text-[10px] text-white/30 font-mono">index.html</span>
        </div>
        <div className="p-4 font-mono text-[11px] leading-relaxed min-h-[140px]">
          {DEMO_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={`${line.color} code-line`}>{line.text}</div>
          ))}
          {visibleLines < DEMO_LINES.length && (
            <span className="inline-block w-1.5 h-3.5 bg-volta-electric align-middle animate-pulse" />
          )}
        </div>
      </div>

      <p className="text-volta-slate-500 text-sm font-medium text-center">{t.emptyTitle}</p>
      <p className="text-volta-slate-400 text-xs mt-1 text-center">{t.emptySubtitle}</p>
    </div>
  );
}

type Device = 'desktop' | 'mobile';
type Tab = 'preview' | 'code';

export function PreviewPanel({ html, isGenerating, onDownload, onCopy, copySuccess, isPro, onExportReact, language }: PreviewPanelProps) {
  const [tab, setTab] = useState<Tab>('preview');
  const [device, setDevice] = useState<Device>('desktop');
  const t = UI_PREVIEW[language];

  // Stable iframe key — only changes when html resets (new generation), not on every chunk
  const [iframeKey, setIframeKey] = useState(0);
  const prevHtmlRef = useRef('');
  useEffect(() => {
    if (html === '' && prevHtmlRef.current !== '') {
      setIframeKey((k) => k + 1);
    }
    prevHtmlRef.current = html;
  }, [html]);

  const isEmpty = !html && !isGenerating;
  const hasContent = !!html;

  return (
    <div className="flex flex-col bg-white rounded-xl border border-volta-slate-200 h-full" style={{ overflow: 'hidden' }}>

      {/* Top toolbar — tabs + device toggle */}
      <div className="flex items-center border-b border-volta-slate-200 px-2 min-h-[48px] shrink-0">
        {/* Tabs */}
        <div className="flex items-center">
          <button
            onClick={() => setTab('preview')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'preview' ? 'text-volta-midnight border-volta-electric' : 'text-volta-slate-500 border-transparent hover:text-volta-midnight'
            }`}
          >
            {t.preview}
          </button>
          <button
            onClick={() => setTab('code')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'code' ? 'text-volta-midnight border-volta-electric' : 'text-volta-slate-500 border-transparent hover:text-volta-midnight'
            }`}
          >
            {t.code}
          </button>
        </div>

        {/* Device toggle — always visible, disabled when no content */}
        <div className="ml-4 flex items-center border border-volta-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setDevice('desktop')}
            disabled={!hasContent}
            title="Desktop view"
            className={`px-2.5 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              device === 'desktop' ? 'bg-volta-slate-100 text-volta-midnight' : 'text-volta-slate-400 hover:text-volta-midnight'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => setDevice('mobile')}
            disabled={!hasContent}
            title="Mobile view"
            className={`px-2.5 py-1.5 transition-colors border-l border-volta-slate-200 disabled:opacity-30 disabled:cursor-not-allowed ${
              device === 'mobile' ? 'bg-volta-slate-100 text-volta-midnight' : 'text-volta-slate-400 hover:text-volta-midnight'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        {hasContent && (
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              onClick={onCopy}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                copySuccess ? 'border-volta-energy text-volta-energy' : 'border-volta-slate-200 text-volta-slate-600 hover:border-volta-slate-300 hover:text-volta-midnight'
              }`}
            >
              {copySuccess ? (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t.copied}</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{t.copy}</>
              )}
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-volta-slate-200 text-volta-slate-600 hover:border-volta-slate-300 hover:text-volta-midnight transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {t.download}
            </button>
            <button
              onClick={onExportReact}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-volta-electric/40 text-volta-electric hover:border-volta-electric hover:bg-volta-electric/5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              React
              {!isPro && <span className="ml-1 text-[9px] font-bold bg-volta-electric text-white px-1 py-0.5 rounded">Pro</span>}
            </button>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 relative" style={{ overflow: 'hidden' }}>

        {/* Empty state */}
        {isEmpty && <AnimatedEmptyState language={language} />}

        {/* Preview — desktop (rendered behind overlay while generating) */}
        {html && tab === 'preview' && device === 'desktop' && (
          <iframe
            key={iframeKey}
            srcDoc={html}
            className={`w-full h-full border-0 transition-opacity duration-700 ${isGenerating ? 'opacity-0' : 'opacity-100'}`}
            title="Generated website preview"
            sandbox="allow-scripts allow-same-origin"
          />
        )}

        {/* Preview — mobile phone frame */}
        {html && tab === 'preview' && device === 'mobile' && (
          <div className={`flex items-center justify-center h-full bg-volta-slate-100 py-4 overflow-auto transition-opacity duration-700 ${isGenerating ? 'opacity-0' : 'opacity-100'}`}>
            <div className="phone-frame shrink-0">
              <div className="phone-statusbar" />
              <iframe
                key={`mobile-${iframeKey}`}
                srcDoc={html}
                className="w-full flex-1 border-0"
                title="Mobile preview"
                sandbox="allow-scripts allow-same-origin"
              />
              <div className="phone-home" />
            </div>
          </div>
        )}

        {/* Code tab — shows live HTML while streaming */}
        {html && tab === 'code' && (
          <pre className="p-4 text-xs font-mono h-full leading-relaxed animate-fadeIn" style={{ overflow: 'auto' }}>
            <code className="text-volta-slate-700 whitespace-pre-wrap break-all">{html}</code>
          </pre>
        )}

        {/* Generating overlay — covers preview for the full duration of streaming */}
        {isGenerating && tab === 'preview' && (
          <div className="absolute inset-0 bg-white z-10">
            <GeneratingState language={language} />
          </div>
        )}
      </div>
    </div>
  );
}
