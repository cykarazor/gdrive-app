// backend/services/drive.js
const createDriveService = require('./googleDriveService');
const authClient = require('../config/googleAuth'); // or wherever your OAuth client is

const driveSvc = createDriveService(authClient);

module.exports = driveSvc;
