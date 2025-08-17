// backend/routes/drive/uploadFile.js
const express = require('express');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '..', '..', 'uploads') });

module.exports = (driveSvc) => {
  const router = express.Router();

  const authErrorPayload = {
    error: 'TokenExpired',
    message: 'Your Google Drive token has expired. Please reauthorize.',
    authUrl: '/auth/google',
  };

  const isAuthError = (err) =>
    err?.code === 401 || err?.status === 401 || err?.message?.includes('invalid_grant');

  router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'file is required' });
    const tempPath = req.file.path;

    try {
      const folderId = req.body.folderId || 'root';
      const data = await driveSvc.uploadFile({
        tempPath,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        folderId,
      });
      res.json({
        id: data.id,
        name: data.name,
        webViewLink: data.webViewLink,
        parents: data.parents,
      });
    } catch (err) {
      console.error('Upload failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Upload failed' });
    } finally {
      try { fs.unlinkSync(tempPath); } catch {}
    }
  });

  return router;
};
