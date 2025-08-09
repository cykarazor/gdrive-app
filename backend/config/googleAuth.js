const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// REPLACE file-based tokenManager with MongoDB tokenService:
const { loadToken, saveToken } = require('../services/tokenService'); // <-- Changed: use MongoDB service instead of ../utils/tokenManager

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

function getOAuth2Client() {
  let credentials;

  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  } else {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  }

  const conf = credentials.installed || credentials.web;

  // Use env var first, then try to detect Render redirect URI, then fallback to first URI
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    conf.redirect_uris.find((uri) => uri.includes('render.com')) ||
    conf.redirect_uris[0];

  return new google.auth.OAuth2(conf.client_id, conf.client_secret, redirectUri);
}

function getAuthUrl(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

/*
  Your existing setCredentials function loads token.json and saves updated tokens on refresh
*/
// function setCredentials(oAuth2Client) {
//   let token = loadToken();
//   if (!token) {
//     throw new Error('No token found in token.json');
//   }
//   console.log('Loaded token:', token);
//   oAuth2Client.setCredentials(token);
//   console.log('✅ Token loaded from token.json');

//   oAuth2Client.on('tokens', (tokens) => {
//     token = { ...token, ...tokens };
//     saveToken(token);
//   });
// }

// UPDATED setCredentials to async to await MongoDB token loading and saving
async function setCredentials(oAuth2Client) {
  const token = await loadToken();
  if (!token) {
    throw new Error('No token found in MongoDB. Please authenticate via /auth/google');
  }
  console.log('Loaded token from MongoDB:', token);
  oAuth2Client.setCredentials(token);
  console.log('✅ Token loaded');

  // Listen for token refresh and save updated tokens to DB asynchronously
  oAuth2Client.on('tokens', async (tokens) => {
    const updatedToken = { ...token, ...tokens };
    await saveToken(updatedToken);
  });
}

/*
  NEW helper function to log token for you during OAuth callback,
  so you can copy it into Render environment variable easily.
*/
function logTokenForRenderEnv(token) {
  console.log('\n=== COPY THIS TOKEN INTO RENDER ENV VAR (GOOGLE_TOKEN_JSON) ===\n');
  console.log(JSON.stringify(token));
  console.log('\n=== END OF TOKEN ===\n');
}

module.exports = {
  getOAuth2Client,
  getAuthUrl,
  // saveToken, // No longer export saveToken directly, handled inside setCredentials now
  setCredentials,
  // TOKEN_PATH, // Removed since token.json file usage is deprecated
  logTokenForRenderEnv, // Export this new helper
};
