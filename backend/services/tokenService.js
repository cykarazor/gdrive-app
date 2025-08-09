// backend/services/tokenService.js
const GoogleToken = require('../models/GoogleToken'); // Your Mongoose model

async function saveToken(tokens, userId = 'defaultUser') {
  try {
    let doc = await GoogleToken.findOne({ userId });

    if (!doc) {
      // When creating new, ensure refreshToken exists
      if (!tokens.refresh_token) {
        throw new Error('No refresh_token provided on first save');
      }
      doc = new GoogleToken({
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: new Date(tokens.expiry_date),
      });
    } else {
      // Update existing fields
      doc.accessToken = tokens.access_token;
      // Only update refreshToken if provided
      if (tokens.refresh_token) {
        doc.refreshToken = tokens.refresh_token;
      }
      doc.scope = tokens.scope;
      doc.tokenType = tokens.token_type;
      doc.expiryDate = new Date(tokens.expiry_date);
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
