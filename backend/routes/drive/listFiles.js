// backend/routes/drive/listFiles.js
module.exports = (driveSvc) => {
  const router = require('express').Router();
  const authErrorPayload = {
    error: 'TokenExpired',
    message: 'Your Google Drive token has expired. Please reauthorize.',
    authUrl: '/auth/google',
  };
  const isAuthError = (err) => err?.code === 401 || err?.status === 401 || err?.message?.includes('invalid_grant');

  router.get('/', async (req, res) => {
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

  return router;
};
