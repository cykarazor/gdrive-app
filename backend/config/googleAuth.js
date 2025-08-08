const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { loadToken, saveToken, TOKEN_PATH } = require('../utils/tokenManager'); //New

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

function setCredentials(oAuth2Client) {
  let token = loadToken();
  if (!token) {
    throw new Error('No token found in token.json');
  }
  console.log('Loaded token:', token);
  oAuth2Client.setCredentials(token);
  console.log('✅ Token loaded from token.json');

  oAuth2Client.on('tokens', (tokens) => {
    token = { ...token, ...tokens };
    saveToken(token);
  });
}

module.exports = {
  getOAuth2Client,
  getAuthUrl,
  saveToken,
  setCredentials,
  TOKEN_PATH,
};
