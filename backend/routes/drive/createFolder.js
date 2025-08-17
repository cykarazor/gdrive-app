// backend/routes/drive/createFolder.js
module.exports = (driveSvc) => {
  const router = require('express').Router();
  const authErrorPayload = {
    error: 'TokenExpired',
    message: 'Your Google Drive token has expired. Please reauthorize.',
    authUrl: '/auth/google',
  };
  const isAuthError = (err) => err?.code === 401 || err?.status === 401 || err?.message?.includes('invalid_grant');

  router.post('/', async (req, res) => {
    try {
      const { name, parentId = 'root' } = req.body || {};
      if (!name?.trim()) return res.status(400).json({ message: 'Folder name is required' });
      const data = await driveSvc.createFolder({ name, parentId });
      res.json({ id: data.id, name: data.name, parents: data.parents });
    } catch (err) {
      console.error('Create folder failed:', err);
      if (isAuthError(err)) return res.status(401).json(authErrorPayload);
      res.status(500).json({ message: 'Failed to create folder' });
    }
  });

  return router;
};
