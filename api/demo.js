import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import vercelPoem from "../src/shared/poem.js";
import { isValidLanguageTag } from "../src/shared/language-utils.js";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function GET(req) {
  // Get the Accept-Language header
  const acceptLanguage = req.headers.get('accept-language') || 'en-US';

  // Extract and validate the primary language
  const primaryLanguage = acceptLanguage.split(',')[0].split(';')[0].trim();

  // Default to en-US if the language tag is invalid
  const validatedLanguage = isValidLanguageTag(primaryLanguage) ? primaryLanguage : 'en-US';

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        // Send the opening HTML and pre tag
        controller.enqueue(encoder.encode('<!DOCTYPE html><html><body><pre>'));
        // Trick Safari's default buffering:
        controller.enqueue(encoder.encode('\u200b'.repeat(1024)));

        const textStream = streamText({
          model: openrouter("openai/gpt-4o-mini"),
          prompt: `Translate the following poem to ${validatedLanguage}, ensuring to use country-specific words, phrases, and slang where applicable. If the target language is English (any variant), feel free to introduce region-specific expressions or idioms.

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

        // Send the closing pre tag and HTML
        controller.enqueue(encoder.encode('</pre></body></html>'));
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 's-maxage=60',
      'Vary': 'Accept-Language'
    },
  });
}
