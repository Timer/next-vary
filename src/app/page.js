import { headers } from "next/headers"
import { Suspense } from "react"
import { TranslatedPoem } from "./translated-poem"

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
Vercel's platform makes our websites sing.`

export default async function LanguageDemo() {
  const headersList = await headers()
  const acceptLanguage = headersList.get("accept-language") || "en-US"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Language-based Content Demo</h1>
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
Cache-Control: s-maxage=60, stale-while-revalidate=86400`}
      </pre>
      <p>
        This means that the response will be cached separately for different Accept-Language values, and shared caches
        (like CDNs) will store it for 60 seconds. After this time, the content can be served stale for up to 24 hours
        while it's being revalidated in the background.
      </p>
      <p>
        Try changing your browser's language settings or using the "Accept-Language" header in your request to see the
        poem translated to different languages. You'll see the translation appear chunk by chunk as it's generated.
      </p>
    </div>
  )
}

export function generateMetadata() {
  return {
    title: "Language-based Content Demo",
  }
}

export async function generateHeaders() {
  return {
    Vary: "Accept-Language",
    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=86400",
  }
}
