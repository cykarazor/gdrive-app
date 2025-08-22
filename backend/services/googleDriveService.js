// backend/services/googleDriveService.js
const fs = require('fs');
const { google } = require('googleapis');
const { getUniqueFileName } = require('../helpers/duplicateNameHelper'); // ✅ imported helper
const { streamFolderAsZip } = require('../helpers/downloadHelper');

module.exports = function createDriveService(auth) {
  const drive = google.drive({ version: 'v3', auth });

  async function listFiles({ folderId = 'root', pageSize = 10, pageToken = null, orderBy = 'folder,name,modifiedTime desc' }) {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      pageSize,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, parents)',
      orderBy,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    return { files: res.data.files || [], nextPageToken: res.data.nextPageToken || null };
  }

  async function listAllFoldersRecursive(parentId = 'root', path = '') {
    let allFolders = [];
    const res = await drive.files.list({
      q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const folder of res.data.files || []) {
      const fullPath = path ? `${path}/${folder.name}` : folder.name;
      allFolders.push({ id: folder.id, name: folder.name, path: fullPath });
      const subfolders = await listAllFoldersRecursive(folder.id, fullPath);
      allFolders = allFolders.concat(subfolders);
    }

    return allFolders;
  }

  async function uploadFile({ tempPath, originalName, mimeType, folderId = 'root' }) {
    const fileMetadata = { name: originalName, parents: [folderId] };
    const media = { mimeType, body: fs.createReadStream(tempPath) };
    const res = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name, webViewLink, parents',
      supportsAllDrives: true,
    });
    return res.data;
  }

  async function createFolder({ name, parentId = 'root' }) {
    const res = await drive.files.create({
      resource: { name: name.trim(), mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
      fields: 'id, name, parents',
      supportsAllDrives: true,
    });
    return res.data;
  }

  async function deleteFile(fileId) {
    const res = await drive.files.update({
      fileId,
      resource: { trashed: true },
      fields: 'id, name, trashed, parents',
      supportsAllDrives: true,
    });
    return res.data;
  }

  async function getParents(fileId) {
    const res = await drive.files.get({ fileId, fields: 'parents', supportsAllDrives: true });
    return res.data.parents || [];
  }

  async function moveFile({ fileId, newParentId }) {
    const prevParents = await getParents(fileId);
    const res = await drive.files.update({
      fileId,
      addParents: newParentId,
      removeParents: prevParents.join(','),
      fields: 'id, parents',
      supportsAllDrives: true,
    });
    return res.data;
  }

  // ✅ Copy a file to another folder with duplicate protection
  async function copyFile({ fileId, destinationFolderId }) {
    // 1️⃣ Get original metadata
    const originalMeta = await getFileMetadata(fileId);

    // 2️⃣ Generate unique name
    const uniqueName = await getUniqueFileName({
      drive,
      parentId: destinationFolderId,
      desiredName: originalMeta.name,
    });

    // 3️⃣ Copy the file
    const res = await drive.files.copy({
      fileId,
      requestBody: {
        name: uniqueName,
        parents: destinationFolderId ? [destinationFolderId] : [],
      },
      fields: 'id, name, mimeType, parents',
      supportsAllDrives: true,
    });

    return res.data;
  }

  async function getFileMetadata(fileId) {
    const res = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, modifiedTime, webViewLink, iconLink, parents, owners, createdTime',
      supportsAllDrives: true,
    });
    return res.data;
  }

  async function downloadFile({ fileId }) {
    const res = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' }
    );
    return res.data;
  }

  async function downloadFolder(folderId, output) {
    // Use the helper to stream folder as ZIP
    await streamFolderAsZip(drive, folderId, output);
  }

  async function renameFile({ fileId, newName }) {
    const res = await drive.files.update({
      fileId,
      requestBody: { name: newName },
      fields: 'id, name',
      supportsAllDrives: true,
    });
    return res.data;
  }

  return {
    drive, // Expose the drive instance for advanced operations if needed
    listFiles,
    listAllFoldersRecursive,
    uploadFile,
    createFolder,
    deleteFile,
    moveFile,
    copyFile, // ✅ updated with duplicate protection
    getFileMetadata,
    downloadFile,
    downloadFolder,
    renameFile,
  };
};
