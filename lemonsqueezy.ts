import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  listWebhooks,
} from '@lemonsqueezy/lemonsqueezy.js';
import crypto from 'crypto';

lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

export const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;

export const VARIANT_IDS = {
  pro_monthly: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID!,
  pro_yearly: process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID!,
};

export async function createCheckoutUrl(
  variantId: string,
  userId: string,
  email: string,
  successUrl: string
): Promise<string> {
  const { data, error } = await createCheckout(STORE_ID, variantId, {
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
    },
    checkoutData: {
      email,
      custom: { userId },
    },
    productOptions: {
      redirectUrl: successUrl,
      receiptButtonText: 'Back to Volta',
      receiptThankYouNote: 'Welcome to Pro! Enjoy unlimited generations.',
    },
  });

  if (error || !data?.data.attributes.url) {
    throw new Error(error?.message || 'Failed to create checkout');
  }

  return data.data.attributes.url;
}

export function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return hmac === signature;
}

export { getSubscription };
