/**
 * Typed error classes for structured error handling.
 *
 * Each error type maps to a specific HTTP status code range so the
 * response handler can return the correct status without guessing.
 */

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

/** 400 - Client sent invalid data */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * 4xx/502 - EasyCashier returned an error.
 * 4xx from upstream are forwarded as-is (client error).
 * 5xx from upstream become 502 Bad Gateway.
 */
export class UpstreamError extends AppError {
  readonly upstreamStatus: number | undefined;
  readonly upstreamBody: unknown;

  constructor(message: string, upstreamStatus?: number, upstreamBody?: unknown) {
    const statusCode =
      upstreamStatus && upstreamStatus >= 400 && upstreamStatus < 500
        ? upstreamStatus
        : 502;
    super(message, statusCode, 'UPSTREAM_ERROR');
    this.upstreamStatus = upstreamStatus;
    this.upstreamBody = upstreamBody;
  }
}

/** 504 - EasyCashier did not respond within the timeout */
export class TimeoutError extends AppError {
  constructor(message = 'Upstream request timed out') {
    super(message, 504, 'TIMEOUT_ERROR');
  }
}
