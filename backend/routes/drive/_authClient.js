// backend/routes/drive/_authClient.js
const { getOAuth2Client, setCredentials } = require('../../config/googleAuth');
const oAuth2Client = getOAuth2Client();


// Load credentials on startup
(async () => {
  try {
    await setCredentials(oAuth2Client);
    console.log('✅ Google OAuth2 client ready');
  } catch (err) {
    console.warn('⚠️ OAuth2 client not ready:', err.message);
  }
})();

module.exports = oAuth2Client;
