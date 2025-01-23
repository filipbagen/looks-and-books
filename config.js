const config = {
  development: {
    baseUrl: 'http://localhost:3000',
    onlineBookingUrlName: 'looksbooks',
  },
  production: {
    baseUrl: 'https://looksandbooks.se/booking-api',
    onlineBookingUrlName: 'looksbooks',
  },
};

function getConfig() {
  return process.env.NODE_ENV === 'production'
    ? config.production
    : config.development;
}

module.exports = getConfig();
