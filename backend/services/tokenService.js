// backend/services/tokenService.js
const GoogleToken = require('../models/GoogleToken'); // Your Mongoose model

async function loadToken(userId = 'defaultUser') {
  try {
    const doc = await GoogleToken.findOne({ userId });
    if (!doc) return null;
    return {
      access_token: doc.accessToken,
      refresh_token: doc.refreshToken,
      scope: doc.scope,
      token_type: doc.tokenType,
      expiry_date: doc.expiryDate.getTime(), // convert Date to timestamp
    };
  } catch (error) {
    console.error('Error loading token from DB:', error);
    return null;
  }
}

async function saveToken(tokens, userId = 'defaultUser') {
  try {
    let doc = await GoogleToken.findOne({ userId });
    const tokenData = {
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope,
      tokenType: tokens.token_type,
      expiryDate: new Date(tokens.expiry_date), // convert to Date
    };

    if (!doc) {
      doc = new GoogleToken(tokenData);
    } else {
      Object.assign(doc, tokenData);
    }

    await doc.save();
    console.log('✅ Token saved to MongoDB');
  } catch (error) {
    console.error('Error saving token to DB:', error);
  }
}

module.exports = {
  loadToken,
  saveToken,
};
