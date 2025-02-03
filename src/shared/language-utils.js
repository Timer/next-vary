/**
 * Validates language tags according to RFC 5646
 * Handles extended formats like zh-Hans-CN (language-script-region)
 * @param {string} tag - The language tag to validate
 * @returns {boolean} Whether the tag is valid
 */
export function isValidLanguageTag(tag) {
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
