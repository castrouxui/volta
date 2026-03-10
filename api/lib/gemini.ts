export interface GeminiImage {
  base64: string;
  mimeType: string;
}

export async function generateSiteImage(prompt: string): Promise<GeminiImage | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Professional, high-quality hero image for a website about: ${prompt}. Modern, clean design, suitable as a website hero background or featured section image. Photo-realistic or high-quality graphic.` }],
          }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );

    if (!res.ok) {
      console.error('Gemini API error:', res.status);
      return null;
    }

    const data = await res.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
        };
      }>;
    };

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p) => p.inlineData);
    if (!imgPart?.inlineData) return null;

    return {
      base64: imgPart.inlineData.data,
      mimeType: imgPart.inlineData.mimeType,
    };
  } catch (err) {
    console.error('Gemini image generation failed:', err);
    return null;
  }
}
