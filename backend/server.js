const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');  // For MongoDB connection

// Import updated googleAuth with async setCredentials
const {
  getOAuth2Client,
  setCredentials,
} = require('./config/googleAuth'); // <== your helper file

const app = express();

// ❌ Original default CORS call (commented out)
// app.use(cors());

// ✅ New CORS configuration to allow frontend requests and handle preflight
const corsOptions = {
  origin: 'https://goodrive-app.netlify.app', // your frontend URL
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Handle OPTIONS preflight requests globally
app.options('*', cors(corsOptions));

app.use(express.json());

connectDB(); // Connect to MongoDB

const oAuth2Client = getOAuth2Client();

// Async wrapper to handle auto token + optional manual fallback
(async () => {
  let authorized = false;

  try {
    // ✅ Attempt automatic token load
    await setCredentials(oAuth2Client);
    authorized = true;
    console.log('✅ Google Drive authorized automatically');
  } catch (err) {
    console.error('❌ Auto token load failed:', err.message);

    // ❌ Keep manual fallback commented but available
    /*
    try {
      setCredentials(oAuth2Client); // synchronous/manual fallback
      authorized = true;
      console.log('✅ Google Drive authorized manually');
    } catch (manualErr) {
      console.error('❌ Manual authorization also failed:', manualErr.message);
      console.log('ℹ️ Visit /auth/google to authorize manually');
    }
    */

    if (!authorized) {
      console.log('ℹ️ If authorization fails, visit:');
      console.log(process.env.NODE_ENV !== 'production' 
        ? 'http://localhost:5000/auth/google' 
        : 'https://gdrive-backend-f94o.onrender.com/auth/google');
    }
  }

  // Use the auth routes
  const authRoutes = require('./routes/auth');
  app.use('/', authRoutes);

  // Pass auth to drive router
  const driveRoutes = require('./routes/drive')(oAuth2Client);
  app.use('/api/drive', driveRoutes);

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();
