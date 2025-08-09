// backend/services/tokenService.js
const GoogleToken = require('../models/GoogleToken'); // Your Mongoose model

async function loadToken() {
  try {
    const doc = await GoogleToken.findOne({});
    return doc ? doc.token : null;
  } catch (error) {
    console.error('Error loading token from DB:', error);
    return null;
  }
}

async function saveToken(token) {
  try {
    let doc = await GoogleToken.findOne({});
    if (!doc) {
      doc = new GoogleToken({ token });
    } else {
      doc.token = token;
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
