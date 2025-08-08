const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

const {
  getOAuth2Client,
  getAuthUrl,
  saveToken,
  setCredentials,
} = require('./config/googleAuth');

const oAuth2Client = getOAuth2Client();

// Route to start OAuth flow
app.get('/auth/google', (req, res) => {
  const authUrl = getAuthUrl(oAuth2Client);
  res.redirect(authUrl);
});

// OAuth callback route
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    saveToken(tokens);
    res.send('✅ Authorization successful. You can close this tab.');
  } catch (err) {
    console.error('Error getting tokens:', err);
    res.status(500).send('Authorization failed');
  }
});

// Use drive routes only after OAuth token saved
app.use(async (req, res, next) => {
  try {
    setCredentials(oAuth2Client);
    const driveRoutes = require('./routes/drive')(oAuth2Client);
    app.use('/api/drive', driveRoutes);
    next();
  } catch (err) {
    res.status(401).send('Unauthorized. Please visit /auth/google to authorize the app.');
  }
});

// Basic root route
app.get('/', (req, res) => {
  res.send('Server is running. Visit /auth/google to authorize.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

//http://localhost:5000/auth/google
