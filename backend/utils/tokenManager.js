const fs = require('fs');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, '..', 'config', 'token.json');

function loadToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    const data = fs.readFileSync(TOKEN_PATH, 'utf8');
    return JSON.parse(data);
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
