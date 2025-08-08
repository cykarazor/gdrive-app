const fs = require('fs');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, '../config/token.json');

function loadToken() {
  if (process.env.GOOGLE_TOKEN_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_TOKEN_JSON);
    } catch (e) {
      console.error('Invalid GOOGLE_TOKEN_JSON environment variable');
      return null;
    }
  }
  
  if (fs.existsSync(TOKEN_PATH)) {
    return JSON.parse(fs.readFileSync(TOKEN_PATH));
  }
  return null;
}

function saveToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token)); // for compact storage
  //fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2)); // for pretty print
  console.log('✅ Token saved to', TOKEN_PATH);
}

module.exports = {
  loadToken,
  saveToken,
};
