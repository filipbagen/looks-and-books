const config = {
  development: {
    baseUrl: 'http://localhost:8888', // Netlify dev server default port
    onlineBookingUrlName: 'looksbooks',
  },
  production: {
    baseUrl: '', // Empty because we're using the same paths relative to the site root
    onlineBookingUrlName: 'looksbooks',
  },
};
