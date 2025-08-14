// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db'); // MongoDB connection

// Import updated googleAuth with async setCredentials
const {
  getOAuth2Client,
  setCredentials,
} = require('./config/googleAuth'); // <== your helper file

const app = express();

// ✅ CORS configuration to allow frontend requests and handle preflight
const corsOptions = {
  origin: 'https://goodrive-app.netlify.app', // frontend URL
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle OPTIONS preflight globally

app.use(express.json());

connectDB(); // Connect to MongoDB

const oAuth2Client = getOAuth2Client();

// COMMENTED OUT old synchronous setCredentials call (fallback)
// try {
//   setCredentials(oAuth2Client);
// } catch (err) {
//   console.error('❌ Failed to load OAuth token:', err.message);
//   console.log('ℹ️ You may need to authenticate via /auth/google');
//   if (process.env.NODE_ENV !== 'production') {
//     console.log('Visit http://localhost:5000/auth/google to authorize');
//   } else {
//     console.log('Visit https://<your-render-url>/auth/google to authorize');
//   }
// }

// ✅ Async wrapper to await setCredentials and then start server
(async () => {
  try {
    await setCredentials(oAuth2Client);
  } catch (err) {
    console.error('❌ Failed to load OAuth token:', err.message);
    console.log('ℹ️ You may need to authenticate via /auth/google');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Visit http://localhost:5000/auth/google to authorize');
    } else {
      console.log(
        'Visit https://gdrive-backend-f94o.onrender.com/auth/google to authorize'
      );
    }
  }

  // Use the auth routes
  const authRoutes = require('./routes/auth'); 
  app.use('/', authRoutes); // ⚠️ Relative path ONLY, do NOT use full URL

  // Pass auth client to drive routes
  const driveRoutes = require('./routes/drive')(oAuth2Client);
  app.use('/api/drive', driveRoutes); // ⚠️ Relative path ONLY

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('ℹ️ To authorize, visit /auth/google');
  });
})();
