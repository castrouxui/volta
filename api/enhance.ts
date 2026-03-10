export const config = {
    runtime: 'edge',
};

import { enhancePrompt } from './lib/claude';
import { supabase } from './lib/supabase';
import { getUserProfile } from './lib/supabase';

async function authenticate(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    return user?.id || null;
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    let body;
    try {
        body = await req.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }

    const { prompt } = body as { prompt?: string };

    if (!prompt?.trim()) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    const userId = await authenticate(req);
    if (!userId) {
        return new Response(JSON.stringify({ error: 'Sign in required', code: 'REQUIRES_AUTH' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const profile = await getUserProfile(userId);
    if (profile?.plan !== 'pro') {
        return new Response(JSON.stringify({ error: 'Prompt enhancement is a Pro feature', code: 'REQUIRES_PRO' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const enhanced = await enhancePrompt(prompt);
        return new Response(JSON.stringify({ enhanced }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Enhance error:', error);
        return new Response(JSON.stringify({ error: 'Failed to enhance prompt' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
