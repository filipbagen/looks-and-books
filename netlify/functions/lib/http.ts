/**
 * Shared HTTP utilities for all Netlify Function handlers.
 *
 * Provides CORS handling, JSON response building, safe body parsing,
 * and a unified error-to-response mapper.
 */

import type { HandlerEvent, HandlerResponse } from './handler';
import { config } from './config';
import { AppError, UpstreamError } from './errors';
import { ZodError } from 'zod';

// ── CORS ──────────────────────────────────────────────────────────

function getCorsOrigin(event: HandlerEvent): string {
  const origin = event.headers['origin'] || '';

  if (config.cors.allowedOrigins.includes(origin)) {
    return origin;
  }

  // Allow localhost during development
  if (origin.startsWith('http://localhost')) {
    return origin;
  }

  // Fallback to first allowed origin
  return config.cors.allowedOrigins[0];
}

export function corsHeaders(event: HandlerEvent): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(event),
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  };
}

// ── Response Builders ─────────────────────────────────────────────

export function jsonResponse(
  statusCode: number,
  data: unknown,
  headers: Record<string, string>,
): HandlerResponse {
  return {
    statusCode,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

export function handleOptions(event: HandlerEvent): HandlerResponse {
  return {
    statusCode: 204,
    headers: corsHeaders(event),
    body: '',
  };
}

// ── Request Parsing ───────────────────────────────────────────────

export function parseBody(event: HandlerEvent): unknown {
  if (!event.body) {
    throw new AppError('Request body is required', 400, 'MISSING_BODY');
  }
  try {
    return JSON.parse(event.body);
  } catch {
    throw new AppError('Invalid JSON in request body', 400, 'INVALID_JSON');
  }
}

// ── Error Response Mapper ─────────────────────────────────────────

export function errorResponse(
  error: unknown,
  headers: Record<string, string>,
): HandlerResponse {
  // Zod validation errors → 400 with details
  if (error instanceof ZodError) {
    return jsonResponse(
      400,
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      },
      headers,
    );
  }

  // Upstream errors with a body → forward the body for client compatibility
  // (preserves the { error: <upstream_body> } shape the frontend expects)
  if (error instanceof UpstreamError && error.upstreamBody !== undefined) {
    return jsonResponse(error.statusCode, { error: error.upstreamBody }, headers);
  }

  // Known application errors → structured response
  if (error instanceof AppError) {
    return jsonResponse(
      error.statusCode,
      { error: { code: error.code, message: error.message } },
      headers,
    );
  }

  // Unknown errors → 500 with no internal details leaked
  console.error('Unhandled error:', error);
  return jsonResponse(
    500,
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    headers,
  );
}
