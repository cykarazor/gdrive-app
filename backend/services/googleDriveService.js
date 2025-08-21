// backend/services/googleDriveService.js
const fs = require('fs');
const { google } = require('googleapis');

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

  async function uploadFile({ tempPath, originalName, mimeType, folderId = 'root' }) {
    const fileMetadata = {
      name: originalName,
      parents: [folderId],
    };
    const media = {
      mimeType,
      body: fs.createReadStream(tempPath),
    };
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
      resource: {
        name: name.trim(),
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id, name, parents',
      supportsAllDrives: true,
    });
    return res.data;
  }

  async function deleteFile(fileId) {
  // Move file or folder to Trash instead of permanent deletion
  const res = await drive.files.update({
    fileId,
    requestBody: { trashed: true }, // ✅ mark as trashed
    supportsAllDrives: true,
  });

  return { success: true, trashed: res.data.trashed }; // returns true if moved to trash
}

  async function getParents(fileId) {
    const res = await drive.files.get({
      fileId,
      fields: 'parents',
      supportsAllDrives: true,
    });
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

  async function getFileMetadata(fileId) {
    const res = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, modifiedTime, webViewLink, iconLink, parents, owners, createdTime',
      supportsAllDrives: true,
    });
    return res.data;
  }

  async function downloadFile({ fileId }) {
    // returns a stream – caller handles piping to response
    const res = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' }
    );
    return res.data; // stream
  }

  return {
    listFiles,
    uploadFile,
    createFolder,
    deleteFile,
    moveFile,
    getFileMetadata,
    downloadFile,
  };
};
