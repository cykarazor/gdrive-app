// backend/routes/drive/downloadFile.js
const express = require('express');

module.exports = (driveSvc) => {
  const router = express.Router();
  const authErrorPayload = { error: 'TokenExpired', message: 'Your Google Drive token has expired. Please reauthorize.', authUrl: '/auth/google' };
  const isAuthError = (err) => err?.code === 401 || err?.status === 401 || err?.message?.includes('invalid_grant');

  router.get('/', async (req, res) => {
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

  return router;
};
