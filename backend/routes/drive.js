//backend/routes/drive.js
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

module.exports = function (auth) {
  const router = require('express').Router();
  const drive = google.drive({ version: 'v3', auth });

  // Simple test connection route
  router.get('/test', async (req, res) => {
    try {
      const response = await drive.files.list({ pageSize: 1 });
      res.json(response.data);
    } catch (err) {
      console.error(err);
      res.status(500).send('Drive API test failed');
    }
  });

  // Upload route
  router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      const fileMetadata = { name: req.file.originalname };
      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };

      const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name',
      });

      fs.unlinkSync(req.file.path);
      res.json({ fileId: file.data.id, fileName: file.data.name });
    } catch (err) {
      console.error('Upload failed:', err);

      if (err.code === 401 || (err.errors && err.errors[0].reason === 'authError')) {
      return res.status(401).json({
        error: 'OAuth token expired or invalid. Please re-authorize by visiting /auth/google.',
      });
    }

      res.status(500).send('Upload failed due to server error');
    }
  });

  return router;
};
