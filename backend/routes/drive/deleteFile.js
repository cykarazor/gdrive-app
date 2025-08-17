// backend/routes/drive/deleteFile.js
const express = require('express');

module.exports = (driveSvc) => {
  const router = express.Router();
  const authErrorPayload = { error: 'TokenExpired', message: 'Your Google Drive token has expired. Please reauthorize.', authUrl: '/auth/google' };
  const isAuthError = (err) => err?.code === 401 || err?.status === 401 || err?.message?.includes('invalid_grant');

  router.delete('/', async (req, res) => {
    try {
      await driveSvc.deleteFile(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('Delete failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Failed to delete file' });
    }
  });

  return router;
};
