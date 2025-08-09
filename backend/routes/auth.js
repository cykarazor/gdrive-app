//backend/routes/auth.js
const express = require('express');
//const { getOAuth2Client, saveToken, logTokenForRenderEnv } = require('../config/googleAuth'); // <-- import the helper
const router = express.Router();
const { getOAuth2Client, logTokenForRenderEnv } = require('../config/googleAuth');
const { saveToken } = require('../services/tokenService');  // <== add this import


const oAuth2Client = getOAuth2Client();

router.get('/auth/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });
  res.redirect(url);
});

router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    //saveToken(tokens);
    await saveToken(tokens, 'defaultUser');  // <-- save the token using the service

    // Log token to console for easy copy/paste from Render logs
    logTokenForRenderEnv(tokens);

    // Also send JSON token in response for convenience
    res.json({
      message: '✅ Authentication successful! Save this token JSON in your Render env var GOOGLE_TOKEN_JSON and restart the backend.',
      token: tokens,
    });

  } catch (err) {
    console.error('❌ Error exchanging code for tokens:', err);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;
