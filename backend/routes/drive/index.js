// backend/routes/drive/index.js
const express = require('express');
const createDriveService = require('../../services/googleDriveService');
const authClient = require('./_authClient');

const router = express.Router();
const driveSvc = createDriveService(authClient);

// Import route modules
const testRoute = require('./testRoute')(driveSvc);
const uploadFile = require('./uploadFile')(driveSvc);
const listFiles = require('./listFiles')(driveSvc);
const createFolder = require('./createFolder')(driveSvc);
const deleteFile = require('./deleteFile')(driveSvc);
const moveFile = require('./moveFile')(driveSvc);
const getFileMetadata = require('./getFileMetadata')(driveSvc);
const downloadFile = require('./downloadFile')(driveSvc);

// Mount route modules
router.use('/test', testRoute);
router.use('/upload', uploadFile);
router.use('/files', listFiles);
router.use('/folder', createFolder);
router.use('/file/:id/delete', deleteFile);
router.use('/file/:id/move', moveFile);
router.use('/file/:id/metadata', getFileMetadata);
router.use('/file/:id/download', downloadFile);

module.exports = router;
