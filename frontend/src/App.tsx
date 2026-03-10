import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useGenerate } from './hooks/useGenerate';
import { Navbar } from './components/Navbar';
import { GeneratorPanel } from './components/GeneratorPanel';
import type { StyleOptions } from './components/StylePanel';
import { buildStyleSuffix } from './components/StylePanel';
import { PreviewPanel } from './components/PreviewPanel';
import { ChatRefinement } from './components/ChatRefinement';
import { PricingModal } from './components/PricingModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function AppBuilder() {
  const auth = useAuth();
  const {
    generate,
    refine,
    isGenerating,
    generatedHtml,
    sessionId,
    error,
    limitError,
    setGeneratedHtml,
  } = useGenerate();

  const [showPricing, setShowPricing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [generationsToday, setGenerationsToday] = useState(0);
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  // Sync generations count from profile
  useEffect(() => {
    if (auth.profile) {
      setGenerationsToday(auth.profile.generations_today);
    }
  }, [auth.profile]);

  // Show error toasts
  useEffect(() => {
    if (error) {
      if (limitError?.requiresAuth) {
        addToast('Sign in to get 5 free generations per day', 'info');
        setShowAuth(true);
      } else if (limitError?.requiresUpgrade) {
        addToast('Daily limit reached — upgrade for unlimited', 'error');
        setShowPricing(true);
      } else {
        addToast(error, 'error');
      }
    }
  }, [error, limitError]);

  // Check URL params for post-checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      addToast('Welcome to Pro! Enjoy unlimited generations 🎉', 'success');
      auth.refreshProfile();
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const addToast = useCallback((message: string, type: ToastItem['type']) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleGenerate = useCallback(async (prompt: string, styleOptions: StyleOptions) => {
    const result = await generate(prompt, {
      token: auth.token,
      sessionId: sessionId ?? undefined,
      logoBase64: styleOptions.logoBase64 || undefined,
      logoMimeType: styleOptions.logoMimeType || undefined,
      styleSuffix: buildStyleSuffix(styleOptions),
      language,
    });
    if (result?.usage) {
      setGenerationsToday(result.usage.generationsToday);
    }
  }, [generate, auth.token, sessionId, language]);

  const handleEnhance = useCallback(async (prompt: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/generate/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) return null;
      const data = await res.json() as { enhanced: string };
      addToast('Prompt enhanced!', 'success');
      return data.enhanced;
    } catch {
      addToast('Failed to enhance prompt', 'error');
      return null;
    }
  }, [auth.token, addToast]);

  const handleRefine = useCallback(async (instruction: string) => {
    if (!generatedHtml) return;
    await refine(instruction, generatedHtml, {
      token: auth.token,
      sessionId: sessionId ?? undefined,
    });
  }, [refine, generatedHtml, auth.token, sessionId]);

  const handleCopy = useCallback(async () => {
    if (!generatedHtml) return;
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopySuccess(true);
      addToast('HTML copied to clipboard', 'success');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    }
  }, [generatedHtml, addToast]);

  const handleDownload = useCallback(() => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volta-website.html';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded successfully', 'success');
  }, [generatedHtml, addToast]);

  const handleExportReact = useCallback(async () => {
    if (!generatedHtml) return;
    if (!auth.isPro) {
      setShowPricing(true);
      return;
    }
    try {
      const res = await fetch('/api/export/react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify({ html: generatedHtml }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Export failed' }));
        addToast(err.error || 'Export failed', 'error');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'volta-react-export.zip';
      a.click();
      URL.revokeObjectURL(url);
      addToast('React export downloaded!', 'success');
    } catch {
      addToast('Export failed', 'error');
    }
  }, [generatedHtml, auth.isPro, auth.token, addToast, setShowPricing]);

  const isConnectionError = error === 'Connection error. Please try again.';

  return (
    <div className="min-h-screen bg-volta-slate-50 flex flex-col dot-grid">
      <Navbar
        onSignInClick={() => setShowAuth(true)}
        onPricingClick={() => setShowPricing(true)}
      />

      {/* Connection error banner */}
      {isConnectionError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center gap-2 text-sm text-red-700 animate-fadeIn">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          <span>
            <strong>Backend not running.</strong> Start it with{' '}
            <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-xs">cd backend && npm run dev</code>{' '}
            and make sure <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-xs">ANTHROPIC_API_KEY</code> is set in <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-xs">backend/.env</code>
          </span>
        </div>
      )}

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 h-[calc(100vh-130px)]">
          {/* Left panel */}
          <div className="flex flex-col overflow-y-auto">
            <GeneratorPanel
              onGenerate={handleGenerate}
              onEnhance={handleEnhance}
              isGenerating={isGenerating}
              hasResult={!!generatedHtml}
              generationsToday={generationsToday}
              isPro={auth.isPro}
              onUpgradeClick={() => setShowPricing(true)}
              language={language}
              onLanguageChange={setLanguage}
            />

            {/* Chat refinement — only show when there's a result */}
            {generatedHtml && (
              <ChatRefinement
                onRefine={handleRefine}
                isGenerating={isGenerating}
                isPro={auth.isPro}
                onUpgradeClick={() => setShowPricing(true)}
                language={language}
              />
            )}
          </div>

          {/* Right panel */}
          <div className="h-full transition-opacity duration-500">
            <PreviewPanel
              html={generatedHtml}
              isGenerating={isGenerating}
              onDownload={handleDownload}
              onCopy={handleCopy}
              copySuccess={copySuccess}
              isPro={auth.isPro}
              onExportReact={handleExportReact}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        token={auth.token}
        onSignInRequired={() => setShowAuth(true)}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onDemoClick={() => { auth.signInAsDemo(); setShowAuth(false); }}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
