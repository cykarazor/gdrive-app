// backend/routes/drive.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });
//const { streamFile, streamFolderAsZip } = require('../helpers/downloadHelper');
const { streamMultipleFilesAndFolders } = require('../helpers/batchDownloadHelper');

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

  // List all folders recursively
  router.get('/folders/all', async (req, res) => {
    try {
      const folders = await driveSvc.listAllFoldersRecursive('root');
      res.json({ folders });
    } catch (err) {
      handleError(res, err, 'Failed to list all folders');
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

  // Delete file/folder (move to trash)
  router.delete('/file/:id', async (req, res) => {
    try {
      // Move file/folder to trash instead of permanent deletion
      const result = await driveSvc.deleteFile(req.params.id);

      res.json({
        success: true,
        trashed: result.trashed, // true if successfully moved to trash
        message: "File/folder moved to trash",
      });
    } catch (err) {
      console.error("Delete error:", err);
      handleError(res, err, 'Failed to move file/folder to trash');
    }
  });

  // Move or paste file/folder
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

  // Paste file/folder (copy or cut)
  router.post('/file/paste', async (req, res) => {
    try {
      const { fileId, targetFolderId, action } = req.body;
      if (!fileId || !targetFolderId || !action) {
        return res.status(400).json({ message: 'fileId, targetFolderId, and action are required' });
      }

      let result;

      if (action === 'copy') {
        // ✅ Now uses driveSvc.copyFile
        result = await driveSvc.copyFile({
          fileId,
          destinationFolderId: targetFolderId,
        });
      } else if (action === 'cut') {
        result = await driveSvc.moveFile({
          fileId,
          newParentId: targetFolderId,
        });
      } else {
        return res.status(400).json({ message: 'Invalid action. Must be "copy" or "cut".' });
      }

      res.json({ success: true, file: result });
    } catch (err) {
      console.error('Paste operation failed:', err);
      handleError(res, err, 'Paste operation failed');
    }
  });

  // Rename file/folder
  router.patch('/file/:id/rename', async (req, res) => {
    try {
      const { newName } = req.body || {};
      if (!newName?.trim()) return res.status(400).json({ message: 'New name is required' });

      const data = await driveSvc.renameFile({
        fileId: req.params.id,
        newName: newName.trim(),
      });

      res.json({
        success: true,
        id: data.id,
        name: data.name,
      });
    } catch (err) {
      handleError(res, err, 'Failed to rename file/folder');
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

  // Download file or folder
  router.get('/file/:id/download', async (req, res) => {
    try {
      const meta = await driveSvc.getFileMetadata(req.params.id);

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(meta.name)}"`
      );
      if (meta.mimeType) res.setHeader('Content-Type', meta.mimeType);

      if (meta.mimeType === 'application/vnd.google-apps.folder') {
        // Folder → stream as ZIP
        await driveSvc.downloadFolder(req.params.id, res);
      } else {
        // File → stream directly
        const fileStream = await driveSvc.downloadFile({ fileId: req.params.id });
        fileStream.pipe(res);
        fileStream.on('error', (err) => {
          console.error('File stream error:', err);
          if (!res.headersSent) res.status(500).end('Download error');
        });
      }
    } catch (err) {
      handleError(res, err, 'Failed to download file/folder');
    }
  });

  // Batch download multiple files and folders
  router.post('/files/download', async (req, res) => {
  try {
    const { fileIds } = req.body;
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ message: 'fileIds array is required' });
    }

    res.setHeader('Content-Disposition', 'attachment; filename="download.zip"');
    res.setHeader('Content-Type', 'application/zip');

    await streamMultipleFilesAndFolders(driveSvc.drive, fileIds, res);
  } catch (err) {
    console.error('Batch download failed:', err);
    res.status(500).json({ message: 'Batch download failed' });
  }
});


  return router;
};
