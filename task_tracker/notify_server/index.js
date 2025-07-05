require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const africastalking = require('africastalking');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Africa's Talking with credentials from .env
const AT = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

const sms = AT.SMS;

// POST /notify - send SMS notifications
app.post('/notify', async (req, res) => {
  const { phoneNumber, message } = req.body;

  try {
    const result = await sms.send({
      to: [`+${phoneNumber}`],
      message,
      from: process.env.AT_SENDER_ID || 'TaskTracker'
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('SMS error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start the SMS server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`🚀 SMS server running on http://localhost:${PORT}`);
});
