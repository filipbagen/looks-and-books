const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.post('/book', async (req, res) => {
  try {
    const response = await axios.post(
      'https://boka.easycashier.se/v1/open/calendar/onlineBooking/reserveTimeSlot',
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
