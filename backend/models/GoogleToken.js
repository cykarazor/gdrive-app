// backend/models/GoogleToken.js
const mongoose = require('mongoose');

const googleTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  scope: String,
  tokenType: String,
  expiryDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('GoogleToken', googleTokenSchema);
