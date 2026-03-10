export const config = {
    runtime: 'edge',
};

import { streamWebsite } from './lib/claude';
import { generateSiteImage } from './lib/gemini';
import { getUserProfile, saveGeneration } from './lib/supabase';
import { supabase } from './lib/supabase';

// Helper to authenticate using edge-compatible Supabase
async function authenticate(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    return user?.id || null;
}

// Memory fallback for IP limits in edge (best effort across same region)
const ipCounts = new Map<string, { count: number; date: string }>();
function getTodayDate(): string { return new Date().toISOString().split('T')[0]; }

export default async function handler(req: Request) {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    let body;
    try {
        body = await req.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }

    const { prompt, sessionId, logoBase64, logoMimeType, styleSuffix, language } = body as any;

    if (!prompt || !prompt.trim()) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    const userId = await authenticate(req);
    let usage = null;

    // Manual Rate Limiting (Edge compatible)
    if (!userId) {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const today = getTodayDate();
        const record = ipCounts.get(ip);
        if (record && record.date === today && record.count >= 3) {
            return new Response(JSON.stringify({
                error: 'Daily limit reached',
                code: 'LIMIT_REACHED',
                requiresAuth: true,
                message: 'Sign up for free to get 5 generations per day',
            }), { status: 429, headers: { 'Content-Type': 'application/json' } });
        }
        if (!record || record.date !== today) {
            ipCounts.set(ip, { count: 1, date: today });
        } else {
            record.count++;
        }
    } else {
        // Reset daily limits if needed
        const today = getTodayDate();
        let profile = await getUserProfile(userId);
        if (profile && profile.last_reset !== today) {
            await supabase.from('profiles').update({ generations_today: 0, last_reset: today }).eq('id', userId);
            profile = await getUserProfile(userId); // refresh
        }
        if (profile && profile.plan !== 'pro') {
            if (profile.generations_today >= 5) {
                return new Response(JSON.stringify({
                    error: 'Daily limit reached',
                    code: 'LIMIT_REACHED',
                    requiresUpgrade: true,
                    message: 'Upgrade to Pro for unlimited generations',
                    generationsToday: profile.generations_today,
                    limit: 5,
                }), { status: 429, headers: { 'Content-Type': 'application/json' } });
            }
            await supabase.rpc('increment_generations', { user_id: userId });
            usage = {
                generationsToday: (profile.generations_today || 0) + 1,
                plan: profile.plan,
                limit: 5,
            };
        } else if (profile && profile.plan === 'pro') {
            usage = { generationsToday: profile.generations_today, plan: 'pro', limit: null };
        }
    }

    // Set up SSE stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            function sendSSE(data: any) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }

            let fullHtml = '';
            try {
                sendSSE({ type: 'start' });

                const heroImage = await generateSiteImage(prompt);

                for await (const chunk of streamWebsite(prompt, [], { logoBase64, logoMimeType, styleSuffix, language, heroImage: heroImage ?? undefined })) {
                    fullHtml += chunk;
                    sendSSE({ type: 'chunk', text: chunk });
                }

                let generationId: string | null = null;
                if (userId) {
                    generationId = await saveGeneration(userId, prompt, fullHtml);
                }

                const sid = sessionId || `anon-${Date.now()}`;

                sendSSE({ type: 'done', sessionId: sid, generationId, usage });
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            } catch (error) {
                console.error('Edge Generation error:', error);
                sendSSE({ type: 'error', message: 'Failed to generate website' });
                controller.close();
            }
        }
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
