import { useState, useCallback, useRef } from 'react';

interface GenerateOptions {
  token?: string;
  sessionId?: string;
  onChunk?: (chunk: string) => void;
  logoBase64?: string;
  logoMimeType?: string;
  styleSuffix?: string;
}

interface UsageInfo {
  generationsToday: number;
  plan: string;
  limit: number | null;
}

interface GenerateResult {
  sessionId: string;
  generationId: string | null;
  usage: UsageInfo | null;
}

export function useGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<{ requiresAuth?: boolean; requiresUpgrade?: boolean } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<GenerateResult | null> => {
    if (!prompt.trim()) return null;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsGenerating(true);
    setError(null);
    setLimitError(null);
    setGeneratedHtml('');

    let accumulated = '';

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          sessionId: options.sessionId,
          logoBase64: options.logoBase64,
          logoMimeType: options.logoMimeType,
          styleSuffix: options.styleSuffix,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string; code?: string; requiresAuth?: boolean; requiresUpgrade?: boolean };
        if (res.status === 429) {
          setLimitError({ requiresAuth: data.requiresAuth, requiresUpgrade: data.requiresUpgrade });
          setError(data.error || 'Generation limit reached');
        } else {
          setError(data.error || 'Generation failed');
        }
        return null;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let result: GenerateResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;

          try {
            const event = JSON.parse(raw) as {
              type: string;
              text?: string;
              sessionId?: string;
              generationId?: string;
              usage?: UsageInfo;
              message?: string;
            };

            if (event.type === 'chunk' && event.text) {
              accumulated += event.text;
              setGeneratedHtml(accumulated);
              options.onChunk?.(event.text);
            } else if (event.type === 'done') {
              result = {
                sessionId: event.sessionId!,
                generationId: event.generationId ?? null,
                usage: event.usage ?? null,
              };
              setSessionId(event.sessionId!);
            } else if (event.type === 'error') {
              setError(event.message || 'Generation failed');
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      return result;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Connection error. Please try again.');
      }
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const refine = useCallback(async (
    instruction: string,
    currentHtml: string,
    options: GenerateOptions = {}
  ): Promise<GenerateResult | null> => {
    if (!instruction.trim() || !currentHtml.trim()) return null;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsGenerating(true);
    setError(null);

    let accumulated = '';

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

      const res = await fetch('/api/generate/refine', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          instruction,
          currentHtml,
          sessionId: options.sessionId || sessionId,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string; code?: string };
        setError(data.error || 'Refinement failed');
        return null;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let result: GenerateResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;

          try {
            const event = JSON.parse(raw) as {
              type: string;
              text?: string;
              sessionId?: string;
              generationId?: string;
              usage?: UsageInfo;
              message?: string;
            };

            if (event.type === 'chunk' && event.text) {
              accumulated += event.text;
              setGeneratedHtml(accumulated);
            } else if (event.type === 'done') {
              result = {
                sessionId: event.sessionId!,
                generationId: event.generationId ?? null,
                usage: event.usage ?? null,
              };
              setSessionId(event.sessionId!);
            } else if (event.type === 'error') {
              setError(event.message || 'Refinement failed');
            }
          } catch {
            // ignore
          }
        }
      }

      return result;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Connection error. Please try again.');
      }
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [sessionId]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
  }, []);

  const reset = useCallback(() => {
    setGeneratedHtml('');
    setSessionId(null);
    setError(null);
    setLimitError(null);
  }, []);

  return {
    generate,
    refine,
    cancel,
    reset,
    isGenerating,
    generatedHtml,
    sessionId,
    error,
    limitError,
    setGeneratedHtml,
  };
}
