const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { google } = require('googleapis');

const router = express.Router();

// File upload setup
const upload = multer({ dest: 'uploads/' });

const CLIENT_SECRET_PATH = path.join(__dirname, '../client_secret.json');
const TOKEN_PATH = path.join(__dirname, '../', process.env.GOOGLE_TOKEN_PATH);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    process.env.GOOGLE_REDIRECT_URI
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  } else {
    throw new Error('Token not found. Please generate token via /api/drive/auth');
  }
}

// Route to generate consent screen URL
router.get('/auth', (req, res) => {
  const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  res.send({ authUrl });
});

// Callback route (after Google OAuth)
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    res.send('Token stored! You can now upload files.');
  } catch (err) {
    res.status(500).send('Error retrieving access token');
  }
});

// 🔁 UPDATED Upload route using multer
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const auth = authorize();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: req.file.originalname,
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name',
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.send({ fileId: file.data.id, fileName: file.data.name });
  } catch (error) {
    res.status(500).send('Upload failed: ' + error.message);
  }
});

module.exports = router;
