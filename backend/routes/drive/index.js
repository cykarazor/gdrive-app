// backend/routes/drive/index.js
const express = require('express');
const driveSvc = require('../../services/drive'); // your new drive service

// Import sub-route modules
const testRoute = require('./testRoute');
const uploadFile = require('./uploadFile');
const listFiles = require('./listFiles');
const createFolder = require('./createFolder');
const deleteFile = require('./deleteFile');
const moveFile = require('./moveFile');
const getFileMetadata = require('./getFileMetadata');
const downloadFile = require('./downloadFile');

const router = express.Router();

// Mount sub-routes, passing driveSvc
router.use('/test', testRoute(driveSvc));
router.use('/upload', uploadFile(driveSvc));
router.use('/files', listFiles(driveSvc));
router.use('/folder', createFolder(driveSvc));
router.use('/file/:id/delete', deleteFile(driveSvc));
router.use('/file/:id/move', moveFile(driveSvc));
router.use('/file/:id/metadata', getFileMetadata(driveSvc));
router.use('/file/:id/download', downloadFile(driveSvc));

module.exports = router;
