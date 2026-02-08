import type { Handler } from './lib/handler';
import { adapter } from './lib/easycashier/adapter';
import { confirmBodySchema } from './lib/validation';
import {
  corsHeaders,
  jsonResponse,
  errorResponse,
  handleOptions,
  parseBody,
} from './lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions(event);

  try {
    const body = parseBody(event);
    const validated = confirmBodySchema.parse(body);
    const data = await adapter.confirmBooking(validated);

    return jsonResponse(200, data, corsHeaders(event));
  } catch (error) {
    return errorResponse(error, corsHeaders(event));
  }
};
