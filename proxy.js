const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

const BASE_URL = 'https://boka.easycashier.se/v1/open/calendar/onlineBooking';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Proxy endpoints
app.get('/services', async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/getServices?onlineBookingUrlName=looksbooks`
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal server error',
    });
  }
});

app.get('/timeslots', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/getAvailableTimeSlots`, {
      params: req.query,
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal server error',
    });
  }
});

app.post('/reserve', async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/reserveTimeSlot`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal server error',
    });
  }
});

app.post('/confirm', async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/confirmOnlineBooking`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal server error',
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
