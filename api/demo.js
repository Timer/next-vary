import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import vercelPoem from "@/shared/poem";

// Validates language tags according to RFC 5646
// Handles extended formats like zh-Hans-CN (language-script-region)
function isValidLanguageTag(tag) {
  // Remove any quality value if present (e.g., 'en-US;q=0.9' -> 'en-US')
  const cleanTag = tag.split(';')[0].trim()

  // More permissive pattern that allows for script subtags (like Hans, Hant)
  // Format: language[-script][-region] where:
  // - language is 2-3 chars
  // - script is 4 chars (optional)
  // - region is 2-3 chars (optional)
  const languageTagPattern = /^[a-zA-Z]{2,3}(-[a-zA-Z]{4})?(-[a-zA-Z]{2,3})?$/

  return languageTagPattern.test(cleanTag)
}

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
