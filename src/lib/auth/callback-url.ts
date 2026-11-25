/**
 * Validates and sanitizes a redirect callbackUrl to strictly prevent Open Redirect vulnerabilities.
 * Only relative paths starting with a single '/' and containing no scheme, host, or backslash are permitted.
 *
 * @param callbackUrl Candidate URL string from query params.
 * @param fallback Default redirect path if candidate is missing or invalid.
 */
export function getSafeCallbackUrl(
  callbackUrl?: string | null,
  fallback = "/account"
): string {
  if (!callbackUrl || typeof callbackUrl !== "string") {
    return fallback;
  }

  const trimmed = callbackUrl.trim();

  // Must begin with a single '/' and NOT '//' (protocol-relative URL) or '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // Must NOT contain a scheme indicator like 'http:', 'https:', 'javascript:'
  if (trimmed.includes("://") || trimmed.includes(":") || trimmed.includes("\\")) {
    return fallback;
  }

  return trimmed;
}
