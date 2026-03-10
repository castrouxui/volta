export const config = {
    runtime: 'edge',
};

import { refineWebsite } from './lib/claude';
import { getUserProfile, saveGeneration } from './lib/supabase';
import { supabase } from './lib/supabase';

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

    const { instruction, currentHtml, sessionId } = body as any;

    if (!instruction?.trim() || !currentHtml?.trim()) {
        return new Response(JSON.stringify({ error: 'instruction and currentHtml are required' }), { status: 400 });
    }

    const userId = await authenticate(req);
    if (!userId) {
        return new Response(JSON.stringify({ error: 'Sign in to use chat refinement', code: 'REQUIRES_AUTH' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const profile = await getUserProfile(userId);
    if (profile?.plan !== 'pro') {
        return new Response(JSON.stringify({ error: 'Chat refinement is a Pro feature', code: 'REQUIRES_PRO' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Refinement stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            function sendSSE(data: any) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }

            let fullHtml = '';
            try {
                sendSSE({ type: 'start' });

                for await (const chunk of refineWebsite(currentHtml, instruction, [])) {
                    fullHtml += chunk;
                    sendSSE({ type: 'chunk', text: chunk });
                }

                let generationId: string | null = null;
                if (userId) {
                    generationId = await saveGeneration(userId, instruction, fullHtml);
                }

                const sid = sessionId || `anon-${Date.now()}`;
                sendSSE({ type: 'done', sessionId: sid, generationId });
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            } catch (error) {
                console.error('Edge Refine error:', error);
                sendSSE({ type: 'error', message: 'Failed to refine website' });
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
