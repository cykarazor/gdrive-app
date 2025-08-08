const express = require('express');
const { getOAuth2Client, saveToken } = require('../config/googleAuth');
const router = express.Router();

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
    saveToken(tokens);
    res.send('✅ Authentication successful! You can close this tab and restart your app.');
  } catch (err) {
    console.error('❌ Error exchanging code for tokens:', err);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;
