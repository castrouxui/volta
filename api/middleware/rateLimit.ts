import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import {
  getUserProfile,
  resetDailyGenerationsIfNeeded,
  incrementGenerationCount,
} from '../lib/supabase';

const FREE_TIER_LIMIT = 5;
// In-memory fallback for unauthenticated users (by IP)
const ipCounts = new Map<string, { count: number; date: string }>();

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function checkGenerationLimit(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Unauthenticated: use IP-based limit (3/day)
  if (!req.userId) {
    const ip = req.ip || 'unknown';
    const today = getTodayDate();
    const record = ipCounts.get(ip);

    if (record && record.date === today && record.count >= 3) {
      res.status(429).json({
        error: 'Daily limit reached',
        code: 'LIMIT_REACHED',
        requiresAuth: true,
        message: 'Sign up for free to get 5 generations per day',
      });
      return;
    }

    if (!record || record.date !== today) {
      ipCounts.set(ip, { count: 1, date: today });
    } else {
      record.count++;
    }

    next();
    return;
  }

  // Authenticated: check DB
  await resetDailyGenerationsIfNeeded(req.userId);
  const profile = await getUserProfile(req.userId);

  if (!profile) {
    next();
    return;
  }

  // Pro users: unlimited
  if (profile.plan === 'pro') {
    next();
    return;
  }

  // Free users: 5/day
  if (profile.generations_today >= FREE_TIER_LIMIT) {
    res.status(429).json({
      error: 'Daily limit reached',
      code: 'LIMIT_REACHED',
      requiresUpgrade: true,
      message: 'Upgrade to Pro for unlimited generations',
      generationsToday: profile.generations_today,
      limit: FREE_TIER_LIMIT,
    });
    return;
  }

  await incrementGenerationCount(req.userId);
  next();
}
