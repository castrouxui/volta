import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/auth/me — get current user profile
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.userId)
    .single();

  if (error) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  res.json({ profile });
});

// GET /api/auth/history — get user's generation history
router.get('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('generations')
    .select('id, prompt, created_at')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
    return;
  }

  res.json({ generations: data });
});

// GET /api/auth/generation/:id — get a specific generation
router.get('/generation/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .single();

  if (error || !data) {
    res.status(404).json({ error: 'Generation not found' });
    return;
  }

  res.json({ generation: data });
});

export default router;
