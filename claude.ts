import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const SYSTEM_PROMPT = `You are an expert web developer specializing in creating stunning, production-ready websites.

When given a description, generate a COMPLETE, self-contained HTML file with:
- Modern, professional design using Tailwind CSS via CDN
- Beautiful typography using Google Fonts (Inter and/or Space Grotesk)
- FULLY RESPONSIVE layout — mobile-first, must look great at 375px, 768px, and 1440px
- Use Tailwind responsive prefixes (sm:, md:, lg:) on every layout element
- Navigation must collapse to a hamburger menu on mobile
- All text must be readable on small screens (min 16px body text)
- Smooth animations and micro-interactions
- Proper semantic HTML5 structure
- No placeholder images — use CSS gradients, SVG patterns, or geometric shapes as visual elements
- All JavaScript inline (no external dependencies except Tailwind CDN)

OUTPUT RULES:
- Output ONLY the raw HTML — no markdown, no code blocks, no explanations
- Start with <!DOCTYPE html> and end with </html>
- Include Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include Google Fonts via <link> in <head>
- Make it production-ready, visually impressive, and pixel-perfect on all screen sizes`;

interface StreamOptions {
  logoBase64?: string;
  logoMimeType?: string;
  styleSuffix?: string;
}

export async function* streamWebsite(
  prompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  options: StreamOptions = {}
): AsyncGenerator<string> {
  const fullPrompt = options.styleSuffix ? `${prompt}\n\n${options.styleSuffix}` : prompt;

  // Build user message — with or without logo image
  type UserContent = Array<Anthropic.ImageBlockParam | Anthropic.TextBlockParam>;

  let userContent: string | UserContent;

  if (options.logoBase64 && options.logoMimeType) {
    userContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: options.logoMimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
          data: options.logoBase64,
        },
      },
      {
        type: 'text',
        text: `${fullPrompt}\n\nThe image above is the logo. Embed it as a base64 data URL in the HTML and use its colors/style to inform the overall design.`,
      },
    ];
  } else {
    userContent = fullPrompt;
  }

  const historyMessages = conversationHistory.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    system: SYSTEM_PROMPT,
    messages: [
      ...historyMessages,
      { role: 'user', content: userContent },
    ],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text;
    }
  }
}

export async function* refineWebsite(
  currentHtml: string,
  instruction: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): AsyncGenerator<string> {
  const refinePrompt = `Here is the current HTML website:

\`\`\`html
${currentHtml}
\`\`\`

User instruction: ${instruction}

Apply the requested changes and return the complete updated HTML. Output ONLY the raw HTML — no markdown, no explanations.`;

  yield* streamWebsite(refinePrompt, conversationHistory);
}

export async function enhancePrompt(roughPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are a creative director and expert UI/UX designer. Transform this rough website idea into a detailed, high-quality design brief that will produce an exceptional website.

Rough idea: "${roughPrompt}"

Write a rich, specific prompt (3-5 sentences) covering: visual style, color palette, typography mood, key sections, animations/interactions, and overall aesthetic. Be concrete and inspiring. Output ONLY the enhanced prompt text, nothing else.`,
    }],
  });

  const text = response.content[0];
  if (text.type === 'text') return text.text.trim();
  return roughPrompt;
}
