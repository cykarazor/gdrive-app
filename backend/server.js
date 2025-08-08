// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const {
  getOAuth2Client,
  setCredentials,
} = require('./config/googleAuth'); // <== your helper file

const app = express();
app.use(cors());
app.use(express.json());

// 1. Get and configure OAuth2 client
const oAuth2Client = getOAuth2Client();

try {
  setCredentials(oAuth2Client);
} catch (err) {
  console.error('❌ Failed to load OAuth token:', err.message);
  console.log('ℹ️ You may need to authenticate via /auth/google');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Visit http://localhost:5000/auth/google to authorize');
  } else {
    console.log('Visit https://<your-render-url>/auth/google to authorize');
  }
}

// Use the auth routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// 2. Pass auth to drive router
const driveRoutes = require('./routes/drive')(oAuth2Client);
app.use('/api/drive', driveRoutes);

// 3. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('ℹ️ To authorize, visit /auth/google');
});
