const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const conf = credentials.installed || credentials.web;

  // Pick 3rd redirect URI if exists, otherwise first
  const redirectUri = conf.redirect_uris[2] || conf.redirect_uris[0];

  return new google.auth.OAuth2(conf.client_id, conf.client_secret, redirectUri);
}

function getAuthUrl(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

function saveToken(token) {
  // Only save token locally if running locally (not on Render)
  if (!process.env.RENDER) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('✅ Token stored at:', TOKEN_PATH);
  } else {
    console.log('ℹ️ Running on Render - skipping token save to file.');
  }
}

function setCredentials(oAuth2Client) {
  let token;
  if (process.env.GOOGLE_TOKEN_JSON) {
    try {
      token = JSON.parse(process.env.GOOGLE_TOKEN_JSON);
      oAuth2Client.setCredentials(token);
      console.log('✅ Token loaded from environment variable.');
    } catch (err) {
      console.error('❌ Invalid GOOGLE_TOKEN_JSON:', err);
      throw err;
    }
  } else if (fs.existsSync(TOKEN_PATH)) {
    token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    console.log('✅ Token loaded from local file.');
  } else {
    throw new Error('No token found');
  }
}

module.exports = {
  getOAuth2Client,
  getAuthUrl,
  saveToken,
  setCredentials,
  TOKEN_PATH,
};
