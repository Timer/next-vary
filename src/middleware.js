import { NextResponse } from 'next/server'

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

export function middleware(request) {
  // Get the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')

  if (acceptLanguage) {
    // Extract the first language preference
    const primaryLanguage = acceptLanguage.split(',')[0]

    // Only proceed with valid language tags
    if (isValidLanguageTag(primaryLanguage)) {
      // Clone the request headers
      const headers = new Headers(request.headers)

      // Set the simplified Accept-Language header
      headers.set('Accept-Language', primaryLanguage)

      // Create a new response with modified headers
      const response = NextResponse.next({
        request: {
          headers
        }
      })

      // Add Vary and Cache-Control headers to the response
      response.headers.set('Vary', 'Accept-Language')
      response.headers.set('Cache-Control', 's-maxage=60')

      return response
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: '/:path*'
}
