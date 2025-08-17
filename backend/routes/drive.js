// backend/routes/drive.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

const createDriveService = require('../services/googleDriveService');

module.exports = function (auth) {
  const router = express.Router();
  const driveSvc = createDriveService(auth);

  // -------------------------
  // Helper functions
  // -------------------------
  const isAuthError = (err) =>
    err?.code === 401 ||
    err?.status === 401 ||
    err?.message?.includes('invalid_grant') ||
    err?.message?.toLowerCase?.().includes('token') ||
    (Array.isArray(err?.errors) && err.errors[0]?.reason === 'authError');

  const authErrorPayload = {
    error: 'TokenExpired',
    message: 'Your Google Drive token has expired. Please reauthorize.',
    authUrl: '/auth/google',
  };

  const handleError = (res, err, fallbackMessage) => {
    console.error(fallbackMessage, err);
    if (isAuthError(err)) return res.status(401).json(authErrorPayload);
    res.status(500).json({ message: fallbackMessage });
  };

  const safeUnlink = (filePath) => {
    try { fs.unlinkSync(filePath); } catch {}
  };

  // -------------------------
  // Routes
  // -------------------------

  // Test connection
  router.get('/test', async (req, res) => {
    try {
      const { files } = await driveSvc.listFiles({ pageSize: 1 });
      res.json({ ok: true, sample: files[0] || null });
    } catch (err) {
      handleError(res, err, 'Drive API test failed');
    }
  });

  // Upload file
  router.post('/upload', upload.single('file'), async (req, res) => {
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
      handleError(res, err, 'Upload failed');
    } finally {
      safeUnlink(tempPath);
    }
  });

  // List files
  router.get('/files', async (req, res) => {
    try {
      const { folderId = 'root', pageSize = 10, pageToken = null, orderBy } = req.query;
      const data = await driveSvc.listFiles({
        folderId,
        pageSize: parseInt(pageSize, 10) || 10,
        pageToken: pageToken || null,
        orderBy: orderBy || 'folder,name,modifiedTime desc',
      });
      res.json(data);
    } catch (err) {
      handleError(res, err, 'Failed to list files');
    }
  });

  // Create folder
  router.post('/folder', async (req, res) => {
    try {
      const { name, parentId = 'root' } = req.body || {};
      if (!name?.trim()) return res.status(400).json({ message: 'Folder name is required' });
      const data = await driveSvc.createFolder({ name, parentId });
      res.json({ id: data.id, name: data.name, parents: data.parents });
    } catch (err) {
      handleError(res, err, 'Failed to create folder');
    }
  });

  // Delete file/folder
  router.delete('/file/:id', async (req, res) => {
    try {
      await driveSvc.deleteFile(req.params.id);
      res.json({ success: true });
    } catch (err) {
      handleError(res, err, 'Failed to delete file');
    }
  });

  // Move file/folder
  router.patch('/file/:id/move', async (req, res) => {
    try {
      const { newParentId } = req.body || {};
      if (!newParentId) return res.status(400).json({ message: 'newParentId is required' });
      const data = await driveSvc.moveFile({ fileId: req.params.id, newParentId });
      res.json({ id: data.id, parents: data.parents });
    } catch (err) {
      handleError(res, err, 'Failed to move file');
    }
  });

  // Get file metadata
  router.get('/file/:id', async (req, res) => {
    try {
      const data = await driveSvc.getFileMetadata(req.params.id);
      res.json(data);
    } catch (err) {
      handleError(res, err, 'Failed to get file metadata');
    }
  });

  // Download file
  router.get('/file/:id/download', async (req, res) => {
    try {
      const meta = await driveSvc.getFileMetadata(req.params.id);
      const stream = await driveSvc.downloadFile({ fileId: req.params.id });

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(meta.name)}"`);
      if (meta.mimeType) res.setHeader('Content-Type', meta.mimeType);

      stream.on('error', (e) => {
        console.error('Download stream error:', e);
        if (!res.headersSent) res.status(500).end('Download error');
      });

      stream.pipe(res);
    } catch (err) {
      handleError(res, err, 'Failed to download file');
    }
  });

  return router;
};
