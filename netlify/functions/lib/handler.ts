/**
 * Netlify Function handler types.
 * Defined locally to avoid an extra @netlify/functions dependency.
 */

export interface HandlerEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  queryStringParameters: Record<string, string | undefined> | null;
  multiValueQueryStringParameters: Record<string, string[] | undefined> | null;
  body: string | null;
  isBase64Encoded: boolean;
}

export interface HandlerResponse {
  statusCode: number;
  headers?: Record<string, string | number | boolean>;
  body: string;
}

export type Handler = (
  event: HandlerEvent,
  context: unknown,
) => Promise<HandlerResponse>;
