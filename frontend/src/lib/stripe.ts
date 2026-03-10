export async function createCheckout(
  plan: 'pro_monthly' | 'pro_yearly',
  token: string
): Promise<void> {
  const res = await fetch('/api/billing/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan }),
  });

  const data = await res.json() as { url?: string; error?: string };
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error(data.error || 'Failed to create checkout');
  }
}

export async function openBillingPortal(token: string): Promise<void> {
  const res = await fetch('/api/billing/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json() as { url?: string; error?: string };
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error(data.error || 'Failed to open portal');
  }
}
