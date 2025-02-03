import { headers } from "next/headers"
import { Suspense } from "react"
import { TranslatedPoem } from "./translated-poem"
import vercelPoem from "@/shared/poem"

export default async function LanguageDemo() {
  const headersList = await headers()
  const acceptLanguage = headersList.get("accept-language") || "en-US"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI-powered content negotiation</h1>
      <p>
        This demo shows how the Vary header can be used for content negotiation based on the Accept-Language header. The
        server will serve different content depending on the user's preferred language.
      </p>
      <div className="bg-gray-100 p-4 rounded space-y-2">
        <h2 className="text-xl font-semibold">Vercel Poem</h2>
        <p>
          <strong>Detected language:</strong> {acceptLanguage}
        </p>
        <Suspense fallback={<div>Preparing translation...</div>}>
          <TranslatedPoem initialContent={vercelPoem} acceptLanguage={acceptLanguage} />
        </Suspense>
      </div>
      <p>The server sets the following headers for this response:</p>
      <pre className="bg-gray-100 p-4 rounded">
        {`Vary: Accept-Language
Cache-Control: s-maxage=60`}
      </pre>
      <p>
        This means that the response will be cached separately for different Accept-Language values, and Vercel will
        store it for 60 seconds.
      </p>
      <p>
        Try changing your browser's language settings or using the "Accept-Language" header in your request to see the
        poem translated to different languages. You'll see the translation appear chunk by chunk as it's generated.
      </p>
    </div>
  )
}
