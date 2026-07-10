/* eslint-disable no-undefined */
const SENSITIVE_HEADER_PATTERN =
  /^(authorization|proxy-authorization|cookie|set-cookie|x-api-key|api-key|x-auth-token|x-access-token|authentication)$/i;

const REDACTED = '[REDACTED]';

/**
 * Redact sensitive HTTP headers (auth tokens, cookies, API keys) for logs/errors.
 */
export function redactHeaders(
  headers?: Record<string, string> | Headers | null,
): Record<string, string> | undefined {
  if (!headers) {
    return undefined;
  }

  const entries: [string, string][] =
    headers instanceof Headers
      ? Array.from(headers.entries())
      : Object.entries(headers);

  const result: Record<string, string> = {};
  for (const [key, value] of entries) {
    result[key] = SENSITIVE_HEADER_PATTERN.test(key) ? REDACTED : value;
  }
  return result;
}

/**
 * Whether a request body should be omitted from error/log payloads.
 * Objects/arrays are summarized; strings are truncated; credentials-looking
 * fields inside plain objects are redacted.
 */
export function redactBody(body: unknown): unknown {
  if (body === undefined || body === null) {
    return body;
  }

  if (typeof body === 'string') {
    if (body.length === 0) {
      return '';
    }
    return body.length > 200 ? `${body.slice(0, 200)}…[truncated]` : body;
  }

  if (typeof body !== 'object') {
    return body;
  }

  if (Array.isArray(body)) {
    return `[Array(${body.length})]`;
  }

  // FormData / Blob / Buffer-like — do not serialize
  if (
    typeof FormData !== 'undefined' && body instanceof FormData ||
    typeof Blob !== 'undefined' && body instanceof Blob ||
    (typeof Buffer !== 'undefined' && Buffer.isBuffer(body))
  ) {
    return '[BinaryOrFormData]';
  }

  const sensitiveKey = /^(password|passwd|secret|token|accessToken|refreshToken|authorization|apiKey|api_key|credential|credentials)$/i;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (sensitiveKey.test(key)) {
      out[key] = REDACTED;
    } else if (typeof value === 'string' && value.length > 200) {
      out[key] = `${value.slice(0, 200)}…[truncated]`;
    } else if (value !== null && typeof value === 'object') {
      out[key] = '[Object]';
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function sanitizeRequestInfo(info?: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}): {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
} | undefined {
  if (!info) {
    return undefined;
  }
  return {
    method: info.method,
    url: info.url,
    headers: redactHeaders(info.headers),
    body: redactBody(info.body),
  };
}

export { REDACTED };
