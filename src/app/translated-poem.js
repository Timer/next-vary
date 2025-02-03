import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { Suspense } from "react"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

async function* generateTranslation(content, language) {
  const result = streamText({
    model: openrouter("openai/gpt-4o-mini"),
    prompt: `Translate the following poem to ${language}, ensuring to use country-specific words, phrases, and slang where applicable. If the target language is English (any variant), feel free to introduce region-specific expressions or idioms:\n\n${content}`,
  })

  for await (const chunk of result.textStream) {
    yield chunk
  }
}

async function StreamingTranslation({
  stream,
}) {
  const { value, done } = await stream.next()

  if (done) {
    return null
  }

  return (
    <>
      {value}
      <Suspense fallback={null}>
        <StreamingTranslation stream={stream} />
      </Suspense>
    </>
  )
}

export async function TranslatedPoem({
  initialContent,
  acceptLanguage,
}) {
  const translationStream = generateTranslation(initialContent, acceptLanguage)

  return (
    <pre className="whitespace-pre-wrap font-serif text-lg">
      <Suspense fallback={<div>Translating...</div>}>
        <StreamingTranslation stream={translationStream} />
      </Suspense>
    </pre>
  )
}
