/**
 * HTTP client for communicating with the EasyCashier API.
 *
 * Features:
 * - AbortController-based request timeouts
 * - Exponential backoff retry on 5xx / network errors
 * - Structured logging of every request for debugging
 * - Proper error classification (timeout vs upstream vs network)
 */

import { config } from '../config';
import { UpstreamError, TimeoutError } from '../errors';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(
  path: string,
  params?: Record<string, string | string[]>,
): string {
  const url = new URL(`${config.easycashier.baseUrl}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          url.searchParams.append(key, v);
        }
      } else {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

/**
 * Fetch with retry and timeout.
 * Retries on 5xx and network errors; does NOT retry on 4xx (client errors).
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const { timeoutMs, maxRetries } = config.http;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const start = Date.now();

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      console.log(
        `[EasyCashier] ${init.method ?? 'GET'} ${url} -> ${response.status} (${Date.now() - start}ms, attempt ${attempt + 1})`,
      );

      // Don't retry on success or client errors (4xx)
      if (response.ok || response.status < 500) {
        return response;
      }

      // 5xx: retry if attempts remain
      if (attempt < maxRetries) {
        console.warn(
          `[EasyCashier] Server error ${response.status}, retrying (${attempt + 1}/${maxRetries})...`,
        );
      }
    } catch (error: unknown) {
      const elapsed = Date.now() - start;
      const isAbortError =
        error instanceof Error && error.name === 'AbortError';

      if (isAbortError) {
        console.error(
          `[EasyCashier] Timeout after ${elapsed}ms (attempt ${attempt + 1})`,
        );
        if (attempt === maxRetries) {
          throw new TimeoutError(
            `EasyCashier request timed out after ${timeoutMs}ms`,
          );
        }
      } else {
        console.error(
          `[EasyCashier] Network error after ${elapsed}ms (attempt ${attempt + 1}):`,
          error,
        );
        if (attempt === maxRetries) {
          throw new UpstreamError(
            `Failed to reach EasyCashier: ${(error as Error).message}`,
          );
        }
      }
    } finally {
      clearTimeout(timer);
    }

    // Exponential backoff: 1s → 2s → 4s (capped)
    await delay(Math.min(1000 * 2 ** attempt, 4000));
  }

  // Should never reach here, but TypeScript needs it
  throw new UpstreamError('Max retries exceeded');
}

/**
 * Parse the response as JSON.
 * On non-OK responses, throws UpstreamError with the parsed body
 * so the error handler can forward it to the client.
 */
async function handleResponse<T>(
  response: Response,
  method: string,
  path: string,
): Promise<T> {
  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text().catch(() => 'Unknown error');
    }
    throw new UpstreamError(
      `EasyCashier ${method} ${path} failed with status ${response.status}`,
      response.status,
      errorBody,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new UpstreamError(
      `EasyCashier ${method} ${path} returned invalid JSON`,
      response.status,
    );
  }
}

// ── Public API ────────────────────────────────────────────────────

export const client = {
  async get<T>(
    path: string,
    params?: Record<string, string | string[]>,
  ): Promise<T> {
    const url = buildUrl(path, params);
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    return handleResponse<T>(response, 'GET', path);
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const url = buildUrl(path);
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response, 'POST', path);
  },
};
