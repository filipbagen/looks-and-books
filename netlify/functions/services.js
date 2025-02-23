// netlify/functions/services.js
const axios = require('axios');

const BASE_URL = 'https://boka.easycashier.se/v1/open/calendar/onlineBooking';
const ONLINE_BOOKING_URL_NAME = process.env.ONLINE_BOOKING_URL_NAME; // Add this to Netlify environment variables

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
    const response = await axios.get(
      `${BASE_URL}/getServices?onlineBookingUrlName=${ONLINE_BOOKING_URL_NAME}`
    );

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
