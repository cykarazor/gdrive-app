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

  // Helper to detect auth errors
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

  // Simple test connection route
  router.get('/test', async (req, res) => {
    try {
      // ❌ Original code commented out
      // const response = await drive.files.list({ pageSize: 1 });
      // res.json(response.data);

      // ✅ NEW: use service
      const { files } = await driveSvc.listFiles({ pageSize: 1 });
      res.json({ ok: true, sample: files[0] || null });
    } catch (err) {
      console.error(err);
      res.status(500).send('Drive API test failed');
    }
  });

  // Upload route
  router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'file is required' });

    const tempPath = req.file.path;

    try {
      // ✅ NEW: allow folderId
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

  // ✅ NEW route: List files (root or inside folder)
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
      console.error('List failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Failed to list files' });
    }
  });

  // ✅ NEW route: Create folder (supports parentId)
  router.post('/folder', async (req, res) => {
    try {
      const { name, parentId = 'root' } = req.body || {};
      if (!name || !name.trim()) return res.status(400).json({ message: 'Folder name is required' });

      const data = await driveSvc.createFolder({ name, parentId });
      res.json({ id: data.id, name: data.name, parents: data.parents });
    } catch (err) {
      console.error('Create folder failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Failed to create folder' });
    }
  });

  // ✅ NEW: Delete file/folder
  router.delete('/file/:id', async (req, res) => {
    try {
      await driveSvc.deleteFile(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('Delete failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Failed to delete file' });
    }
  });

  // ✅ NEW: Move file/folder
  router.patch('/file/:id/move', async (req, res) => {
    try {
      const { newParentId } = req.body || {};
      if (!newParentId) return res.status(400).json({ message: 'newParentId is required' });

      const data = await driveSvc.moveFile({ fileId: req.params.id, newParentId });
      res.json({ id: data.id, parents: data.parents });
    } catch (err) {
      console.error('Move failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Failed to move file' });
    }
  });

  // ✅ NEW: Get file metadata
  router.get('/file/:id', async (req, res) => {
    try {
      const data = await driveSvc.getFileMetadata(req.params.id);
      res.json(data);
    } catch (err) {
      console.error('Get metadata failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Failed to get file metadata' });
    }
  });

  // ✅ NEW: Download file
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
      console.error('Download failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Failed to download file' });
    }
  });

  // ✅ NEW: Keep backward-compatible aliases for existing frontend
  // ❌ OLD problematic code (commented out):
  // router.get('/list', async (req, res) => {
  //   req.url = req.url.replace('/list', '/files');
  //   return router.handle(req, res);
  // });
  // router.post('/create-folder', async (req, res) => {
  //   req.url = req.url.replace('/create-folder', '/folder');
  //   return router.handle(req, res);
  // });

  // ✅ FIXED: Use redirect / next instead
  // GET /api/drive/list -> /api/drive/files
  router.get('/list', (req, res) => {
    // Redirect to /files with same query params
    const query = req.url.includes('?') ? req.url.split('?')[1] : '';
    res.redirect(`/api/drive/files${query ? '?' + query : ''}`);
  });

  // POST /api/drive/create-folder -> /api/drive/folder
  router.post('/create-folder', (req, res, next) => {
    // Forward the request internally
    req.url = '/folder';
    next(); // pass to /folder route
  });

  return router;
};
