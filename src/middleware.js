import { NextResponse } from 'next/server'
import { isValidLanguageTag } from '@/shared/language-utils'

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
