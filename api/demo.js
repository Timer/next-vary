import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

const vercelPoem = `In the realm of web, where dreams take flight,
Vercel stands tall, a beacon of light.
Deployments swift, performance so grand,
Empowering devs across the land.

Next.js and React, tools of choice,
In Vercel's ecosystem, they rejoice.
From static sites to dynamic apps,
It scales with ease, no performance gaps.

Fluid compute near, latency low,
Global CDN makes content flow.
Analytics deep, insights so clear,
Optimizing sites year after year.

Collaborative teams, working as one,
Projects flourish under the Vercel sun.
In this digital age, where speed is king,
Vercel's platform makes our websites sing.`;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function GET(req) {
  // Get the Accept-Language header
  const acceptLanguage = req.headers.get('accept-language') || 'en-US';
  const primaryLanguage = acceptLanguage.split(',')[0].split(';')[0].trim();
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        const textStream = streamText({
          model: openrouter("openai/gpt-4-mini"),
          prompt: `Translate the following poem to ${primaryLanguage}, ensuring to use country-specific words, phrases, and slang where applicable. If the target language is English (any variant), feel free to introduce region-specific expressions or idioms.

Important: Do NOT translate the following technical terms - keep them exactly as they appear:
- Next.js
- React
- CDN
- Fluid compute
- Vercel

Here's the text to translate:

${vercelPoem}`,
        });

        for await (const chunk of textStream.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=60',
      'Vary': 'Accept-Language'
    },
  });
}
