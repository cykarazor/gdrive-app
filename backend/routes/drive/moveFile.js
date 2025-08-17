// backend/routes/drive/moveFile.js
module.exports = (driveSvc) => {
  const router = require('express').Router();
  const authErrorPayload = { error: 'TokenExpired', message: 'Your Google Drive token has expired. Please reauthorize.', authUrl: '/auth/google' };
  const isAuthError = (err) => err?.code === 401 || err?.status === 401 || err?.message?.includes('invalid_grant');

  router.patch('/', async (req, res) => {
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

  return router;
};
