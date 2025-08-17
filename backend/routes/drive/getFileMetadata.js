// backend/routes/drive/getFileMetadata.js
module.exports = (driveSvc) => {
  const router = require('express').Router();
  const authErrorPayload = { error: 'TokenExpired', message: 'Your Google Drive token has expired. Please reauthorize.', authUrl: '/auth/google' };
  const isAuthError = (err) => err?.code === 401 || err?.status === 401 || err?.message?.includes('invalid_grant');

  router.get('/', async (req, res) => {
    try {
      const data = await driveSvc.getFileMetadata(req.params.id);
      res.json(data);
    } catch (err) {
      console.error('Get metadata failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Failed to get file metadata' });
    }
  });

  return router;
};

