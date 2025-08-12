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

  if (
    err.code === 401 ||
    (err.errors && err.errors[0].reason === 'authError') ||
    err.message.includes('invalid_grant') ||
    err.message.includes('token')
  ) {
    return res.status(401).json({
      error: 'TokenExpired',
      message: 'Your Google Drive token has expired. Click here to reauthorize.',
      authUrl: '/auth/google'  // 👈 optional helper
    });
  }

  res.status(500).send('Upload failed due to server error');
}
  });

  // ✅ New route to list files with pagination support
router.get('/list', async (req, res) => {
  try {
    // NEW: Get pagination params from query
    const pageSize = parseInt(req.query.pageSize, 10) || 10; // NEW
    const pageToken = req.query.pageToken || null; // NEW

    const response = await drive.files.list({
      // pageSize: 10, // ❌ OLD: hardcoded limit
      pageSize, // ✅ NEW: use dynamic limit
      pageToken, // ✅ NEW: support next page
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size)', // ✅ NEW: include nextPageToken
      orderBy: 'modifiedTime desc',
    });

    // NEW: Return pagination info to frontend
    res.status(200).json({
      files: response.data.files,
      nextPageToken: response.data.nextPageToken || null, // NEW
    });
  } catch (error) {
    console.error('❌ Error listing files:', error.message);
    if (
      error.code === 401 ||
      (error.errors && error.errors[0].reason === 'authError') ||
      error.message.includes('invalid_grant') ||
      error.message.includes('token')
    ) {
      return res.status(401).json({
        error: 'TokenExpired',
        message: 'Your Google Drive token has expired. Click here to reauthorize.',
        authUrl: '/auth/google'  // 👈 optional helper
      });
    }
    res.status(500).json({ message: 'Failed to list files' });
  }
});


// Create folder route
router.post('/create-folder', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // Folder metadata
    const fileMetadata = {
      name: name.trim(),
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name',
    });

    res.status(200).json({
      folderId: folder.data.id,
      folderName: folder.data.name,
    });
  } catch (err) {
    console.error('Create folder failed:', err);

    if (
      err.code === 401 ||
      (err.errors && err.errors[0].reason === 'authError') ||
      err.message.includes('invalid_grant') ||
      err.message.includes('token')
    ) {
      return res.status(401).json({
        error: 'TokenExpired',
        message: 'Your Google Drive token has expired. Click here to reauthorize.',
        authUrl: '/auth/google',
      });
    }

    res.status(500).json({ message: 'Failed to create folder due to server error' });
  }
});

  return router;
};
