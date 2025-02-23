const axios = require('axios');

const BASE_URL = 'https://boka.easycashier.se/v1/open/calendar/onlineBooking';
// Simple in-memory cache (exists only while the function instance is warm)
const cache = {};
const CACHE_DURATION = 60 * 1000; // Cache duration: 1 minute

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  // Create a cache key based on the query parameters
  const params = event.queryStringParameters;
  const cacheKey = JSON.stringify(params);
  const now = Date.now();

  // Check if we have a recent cache entry
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(cache[cacheKey].data),
    };
  }

  try {
    const response = await axios.get(`${BASE_URL}/getAvailableTimeSlots`, {
      params,
    });
    const data = response.data;

    // Store the result in cache
    cache[cacheKey] = { data, timestamp: Date.now() };

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.response?.data || 'Internal server error',
      }),
    };
  }
};
