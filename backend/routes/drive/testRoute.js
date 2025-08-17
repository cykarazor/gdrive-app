// backend/routes/drive/testRoute.js
module.exports = (driveSvc) => {
  const router = require('express').Router();

  router.get('/', async (req, res) => {
    try {
      const { files } = await driveSvc.listFiles({ pageSize: 1 });
      res.json({ ok: true, sample: files[0] || null });
    } catch (err) {
      console.error(err);
      res.status(500).send('Drive API test failed');
    }
  });

  return router;
};
