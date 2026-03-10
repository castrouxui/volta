import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const SYSTEM_PROMPT = `You are a world-class creative director and senior frontend engineer. You build websites that look handcrafted by a top design studio — NOT generic AI output.

DESIGN PHILOSOPHY — break the AI template curse:
- NEVER use the same tired hero layout (centered h1 + subtitle + two CTA buttons). Surprise the eye.
- Choose colors that fit the brand's personality — earthy tones for food/nature, neon+dark for tech, pastels for lifestyle. Never default to generic indigo unless the brief demands it.
- Mix font weights and sizes dramatically. Create visual tension. A 96px headline next to 14px fine print feels designed.
- Use asymmetry, overlap, diagonal clip-paths, and off-grid elements to add energy.
- Every page must have its own personality — a personality a designer would be proud to sign.

CONTENT — write like a real copywriter, not an AI:
- Invent a specific brand name, tagline, and product/service with actual personality (e.g. "Mira AI — see what's coming" not "Your AI Solution").
- Write sharp, specific headlines. No "Transform your business." Write "Ship in days, not quarters."
- Use real-feeling stats: "2,847 teams launched this month", "99.97% uptime", "Under 200ms load time".
- Invent specific testimonials with real names, job titles, and opinionated quotes (e.g. "María García, CPO at Mercado Libre").
- Write actual feature descriptions — specific benefits, not generic buzzwords.
- Make the copy feel like a human with opinions wrote it.

VISUAL TECHNIQUES — make it feel alive:
- Add scroll-triggered reveal animations using IntersectionObserver (fade-up, slide-in, stagger).
- Use CSS custom properties (--color-primary, etc.) in a <style> tag for cohesive theming.
- Create gradient meshes, noise textures, or geometric SVG backgrounds for depth.
- Use clip-path on sections for non-rectangular edges (diagonal dividers, angled sections).
- Add hover effects with transforms: cards that tilt 3D on hover, buttons that glow, links that underline with color.
- Use CSS @keyframes for looping background animations, floating elements, or shimmer effects.
- Include a sticky nav with backdrop-filter: blur() that becomes opaque on scroll.
- Use Tailwind's arbitrary values for unique spacing/sizing.

LAYOUT VARIETY — never repeat the same structure:
- Alternate between: split-screen heroes, full-bleed video-style backgrounds, editorial magazine layouts, bento grid features, horizontal scroll sections, overlapping card stacks.
- Section backgrounds should vary: some white, some dark, some colored, some with subtle patterns.
- Use generous whitespace AND dense information zones — contrast between breathing room and richness.

TECHNICAL REQUIREMENTS:
- Tailwind CSS via CDN + custom CSS in <style> tag for effects Tailwind can't do
- Google Fonts — choose a pairing that fits the brand (e.g. Playfair Display + DM Sans, Syne + Inter, Cabinet Grotesk + Instrument Serif)
- Fully responsive: 375px mobile, 768px tablet, 1440px desktop. Use sm:, md:, lg: prefixes.
- Hamburger menu on mobile with JS toggle
- Navigation links use anchor IDs matching real section IDs (href="#features" → <section id="features">). NEVER href="#" or href="javascript:void(0)"
- All JS inline, no external deps except CDNs
- Semantic HTML5

OUTPUT RULES:
- Output ONLY raw HTML — no markdown, no code blocks, no explanations
- Start with <!DOCTYPE html>, end with </html>
- Include <script src="https://cdn.tailwindcss.com"></script>
- Include Google Fonts <link> in <head>`;

interface StreamOptions {
  logoBase64?: string;
  logoMimeType?: string;
  styleSuffix?: string;
  language?: string;
}

export async function* streamWebsite(
  prompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  options: StreamOptions = {}
): AsyncGenerator<string> {
  const languageInstruction = options.language === 'es'
    ? '\n\nLANGUAGE: Generate ALL website text content (headings, body copy, buttons, labels, nav links, descriptions, testimonials, etc.) in Spanish (Latin American). Use natural, modern Spanish appropriate for professional websites.'
    : '';

  const fullPrompt = options.styleSuffix
    ? `${prompt}\n\n${options.styleSuffix}${languageInstruction}`
    : `${prompt}${languageInstruction}`;

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
    max_tokens: 12000,
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
      content: `You are a world-class creative director at a top design studio. Transform this rough idea into a detailed design brief that will produce a website that looks handcrafted, not AI-generated.

Rough idea: "${roughPrompt}"

Write a rich, opinionated brief (4-6 sentences) covering:
- A specific brand name, personality and voice (e.g. bold/irreverent/warm/minimal)
- Exact color palette with hex codes (not generic, pick something memorable)
- Typography pairing that fits the mood
- Hero layout concept (NOT the generic centered h1 + subtitle — be creative)
- 3-4 key sections with specific content ideas
- One signature animation or interaction that makes it feel alive

Be concrete, specific, and inspiring. Output ONLY the enhanced prompt, nothing else.`,
    }],
  });

  const text = response.content[0];
  if (text.type === 'text') return text.text.trim();
  return roughPrompt;
}
