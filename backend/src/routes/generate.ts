import { Router, Response } from 'express';
import { AuthRequest, optionalAuth, requireAuth } from '../middleware/auth';
import { checkGenerationLimit } from '../middleware/rateLimit';
import { streamWebsite, refineWebsite, enhancePrompt } from '../lib/claude';
import { saveGeneration, getUserProfile } from '../lib/supabase';

const router = Router();

const sessions = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>();

function sendSSE(res: Response, data: Record<string, unknown>): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// POST /api/generate
router.post('/', optionalAuth, checkGenerationLimit, async (req: AuthRequest, res: Response) => {
  const { prompt, sessionId, logoBase64, logoMimeType, styleSuffix, language } = req.body as {
    prompt?: string;
    sessionId?: string;
    logoBase64?: string;
    logoMimeType?: string;
    styleSuffix?: string;
    language?: string;
  };

  if (!prompt?.trim()) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let fullHtml = '';

  try {
    sendSSE(res, { type: 'start' });

    for await (const chunk of streamWebsite(prompt, [], { logoBase64, logoMimeType, styleSuffix, language })) {
      fullHtml += chunk;
      sendSSE(res, { type: 'chunk', text: chunk });
    }

    let generationId: string | null = null;
    if (req.userId) {
      generationId = await saveGeneration(req.userId, prompt, fullHtml);
    }

    const sid = sessionId || `anon-${Date.now()}`;
    sessions.set(sid, [
      { role: 'user', content: prompt },
      { role: 'assistant', content: fullHtml },
    ]);

    let usage = null;
    if (req.userId) {
      const profile = await getUserProfile(req.userId);
      if (profile) {
        usage = {
          generationsToday: profile.generations_today,
          plan: profile.plan,
          limit: profile.plan === 'pro' ? null : 5,
        };
      }
    }

    sendSSE(res, { type: 'done', sessionId: sid, generationId, usage });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Generation error:', error);
    sendSSE(res, { type: 'error', message: 'Failed to generate website' });
    res.end();
  }
});

// POST /api/generate/refine
router.post('/refine', optionalAuth, checkGenerationLimit, async (req: AuthRequest, res: Response) => {
  const { instruction, currentHtml, sessionId } = req.body as {
    instruction?: string;
    currentHtml?: string;
    sessionId?: string;
  };

  if (!instruction?.trim() || !currentHtml?.trim()) {
    res.status(400).json({ error: 'instruction and currentHtml are required' });
    return;
  }

  if (req.userId) {
    const profile = await getUserProfile(req.userId);
    if (profile?.plan !== 'pro') {
      res.status(403).json({ error: 'Chat refinement is a Pro feature', code: 'REQUIRES_PRO' });
      return;
    }
  } else {
    res.status(403).json({ error: 'Sign in to use chat refinement', code: 'REQUIRES_AUTH' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let fullHtml = '';
  const history = sessions.get(sessionId || '') || [];

  try {
    sendSSE(res, { type: 'start' });

    for await (const chunk of refineWebsite(currentHtml, instruction, history)) {
      fullHtml += chunk;
      sendSSE(res, { type: 'chunk', text: chunk });
    }

    const sid = sessionId || `anon-${Date.now()}`;
    history.push(
      { role: 'user', content: instruction },
      { role: 'assistant', content: fullHtml }
    );
    sessions.set(sid, history.slice(-10));

    let generationId: string | null = null;
    if (req.userId) {
      generationId = await saveGeneration(req.userId, instruction, fullHtml);
    }

    sendSSE(res, { type: 'done', sessionId: sid, generationId });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Refinement error:', error);
    sendSSE(res, { type: 'error', message: 'Failed to refine website' });
    res.end();
  }
});

// POST /api/generate/enhance — Pro only, expand rough prompt
router.post('/enhance', requireAuth, async (req: AuthRequest, res: Response) => {
  const { prompt } = req.body as { prompt?: string };

  if (!prompt?.trim()) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const profile = await getUserProfile(req.userId!);
  if (profile?.plan !== 'pro') {
    res.status(403).json({ error: 'Prompt enhancement is a Pro feature', code: 'REQUIRES_PRO' });
    return;
  }

  try {
    const enhanced = await enhancePrompt(prompt);
    res.json({ enhanced });
  } catch (error) {
    console.error('Enhance error:', error);
    res.status(500).json({ error: 'Failed to enhance prompt' });
  }
});

export default router;
