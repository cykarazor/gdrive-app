// backend/routes/drive/testRoute.js
const express = require('express');

module.exports = (driveSvc) => {
  const router = express.Router();

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
