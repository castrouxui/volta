import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import {
  createCheckoutUrl,
  verifyWebhookSignature,
  VARIANT_IDS,
} from '../lib/lemonsqueezy';
import { updateUserPlan, getUserProfile } from '../lib/supabase';

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// POST /api/billing/create-checkout
router.post('/create-checkout', requireAuth, async (req: AuthRequest, res: Response) => {
  const { plan } = req.body as { plan?: 'pro_monthly' | 'pro_yearly' };

  if (!plan || !VARIANT_IDS[plan]) {
    res.status(400).json({ error: 'Invalid plan' });
    return;
  }

  try {
    const url = await createCheckoutUrl(
      VARIANT_IDS[plan],
      req.userId!,
      req.userEmail!,
      `${FRONTEND_URL}?checkout=success`
    );
    res.json({ url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// GET /api/billing/plan — get current plan info
router.get('/plan', requireAuth, async (req: AuthRequest, res: Response) => {
  const profile = await getUserProfile(req.userId!);
  res.json({
    plan: profile?.plan || 'free',
    subscriptionId: profile?.stripe_subscription_id || null,
  });
});

// POST /api/billing/webhook — Lemon Squeezy webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-signature'] as string;
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  if (!verifyWebhookSignature(req.body as Buffer, signature, secret)) {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse((req.body as Buffer).toString()) as Record<string, unknown>;
  } catch {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  const eventName = payload.meta && typeof payload.meta === 'object'
    ? (payload.meta as Record<string, unknown>).event_name as string
    : '';

  const data = payload.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;
  const customData = attributes?.custom_data as Record<string, unknown> | undefined;
  const userId = customData?.userId as string | undefined;

  try {
    switch (eventName) {
      case 'order_created': {
        // One-time purchase or first subscription payment
        if (userId) {
          const subscriptionId = data?.id as string | undefined;
          await updateUserPlan(userId, 'pro', undefined, subscriptionId);
        }
        break;
      }

      case 'subscription_created':
      case 'subscription_resumed': {
        if (userId) {
          const subscriptionId = data?.id as string | undefined;
          await updateUserPlan(userId, 'pro', undefined, subscriptionId);
        }
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        if (userId) {
          await updateUserPlan(userId, 'free');
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
