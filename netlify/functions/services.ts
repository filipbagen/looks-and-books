import type { Handler } from './lib/handler';
import { adapter } from './lib/easycashier/adapter';
import { corsHeaders, jsonResponse, errorResponse, handleOptions } from './lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions(event);

  try {
    const data = await adapter.getServices();

    return jsonResponse(200, data, {
      ...corsHeaders(event),
      'Cache-Control': 'public, s-maxage=300, max-age=60',
    });
  } catch (error) {
    return errorResponse(error, corsHeaders(event));
  }
};
