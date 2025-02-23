// netlify/functions/timeslots.js
const axios = require('axios');

const BASE_URL = 'https://boka.easycashier.se/v1/open/calendar/onlineBooking';

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const params = event.queryStringParameters;
    const response = await axios.get(`${BASE_URL}/getAvailableTimeSlots`, {
      params,
    });

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(response.data),
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
