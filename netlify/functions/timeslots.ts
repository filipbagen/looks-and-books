import type { Handler } from './lib/handler';
import { adapter } from './lib/easycashier/adapter';
import { timeSlotsQuerySchema } from './lib/validation';
import { corsHeaders, jsonResponse, errorResponse, handleOptions } from './lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions(event);

  try {
    const rawParams = {
      dateStart: event.queryStringParameters?.dateStart,
      dateStop: event.queryStringParameters?.dateStop,
      serviceIds: event.queryStringParameters?.serviceIds,
      resourceIds:
        event.multiValueQueryStringParameters?.resourceIds ??
        (event.queryStringParameters?.resourceIds
          ? [event.queryStringParameters.resourceIds]
          : undefined),
    };

    const params = timeSlotsQuerySchema.parse(rawParams);
    const data = await adapter.getTimeSlots(params);

    return jsonResponse(200, data, {
      ...corsHeaders(event),
      'Cache-Control': 'public, s-maxage=60, max-age=30',
    });
  } catch (error) {
    return errorResponse(error, corsHeaders(event));
  }
};
