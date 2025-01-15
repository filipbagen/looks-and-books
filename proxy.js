// proxy.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for your frontend
app.use(cors());

// Serve static files (your HTML/JS)
app.use(
  express.static('public', {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    },
  })
);

// Proxy all /api/* requests to EasyCashier
app.use(
  '/api',
  createProxyMiddleware({
    target: 'https://boka.easycashier.se',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  })
);

// Modified frontend code (save as public/booking.js)
// Update all fetch URLs to use the proxy
async function fetchServices() {
  try {
    const response = await fetch(
      '/api/v1/open/calendar/onlineBooking/getServices?onlineBookingUrlName=looksbooks'
    );
    const data = await response.json();
    services = data.serviceGroups;
    displayStaff();
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

// Updated timeSlots fetch
async function fetchTimeSlots() {
  const dateStart = selectedDate;
  const dateEnd = new Date(selectedDate);
  dateEnd.setDate(dateEnd.getDate() + 6);

  try {
    const response = await fetch(
      `/api/v1/open/calendar/onlineBooking/getAvailableTimeSlots?` +
        `dateStart=${dateStart}&dateStop=${
          dateEnd.toISOString().split('T')[0]
        }&` +
        `onlineBookingUrlName=looksbooks&` +
        `serviceIds=${selectedService.serviceId}&` +
        `resourceIds=${selectedStaff.resourceId}`
    );
    const data = await response.json();
    displayTimeSlots(data.availableSlots || []);
  } catch (error) {
    console.error('Error fetching time slots:', error);
  }
}

// Updated booking function
async function handleBooking(slot) {
  try {
    const reserveResponse = await fetch(
      '/api/v1/open/calendar/onlineBooking/reserveTimeSlot',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService.serviceId,
          resourceId: selectedStaff.resourceId,
          startTime: slot.startTime,
        }),
      }
    );

    if (reserveResponse.ok) {
      const confirmResponse = await fetch(
        '/api/v1/open/calendar/onlineBooking/confirmOnlineBooking',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Add required fields
          }),
        }
      );

      if (confirmResponse.ok) {
        alert('Booking confirmed!');
      }
    }
  } catch (error) {
    console.error('Error making booking:', error);
  }
}
