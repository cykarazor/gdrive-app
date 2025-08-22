// backend/helpers/downloadHelper.js
const archiver = require('archiver');

/**
 * Stream a single file from Google Drive.
 * @param {object} drive - Authenticated Google Drive client
 * @param {string} fileId - File ID
 * @returns {stream.Readable} - Readable stream of the file
 */
async function streamFile(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' }
  );
  return res.data;
}

/**
 * Stream a folder as a ZIP archive.
 * @param {object} drive - Authenticated Google Drive client
 * @param {string} folderId - Folder ID
 * @param {stream.Writable} output - Response stream
 */
async function streamFolderAsZip(drive, folderId, output) {
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Recursively list files and add to ZIP
  async function addFolderToArchive(currentFolderId, path = '') {
    const res = await drive.files.list({
      q: `'${currentFolderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const file of res.data.files || []) {
      const filePath = path ? `${path}/${file.name}` : file.name;

      if (file.mimeType === 'application/vnd.google-apps.folder') {
        await addFolderToArchive(file.id, filePath);
      } else {
        const fileStream = await streamFile(drive, file.id);
        archive.append(fileStream, { name: filePath });
      }
    }
  }

  await addFolderToArchive(folderId);
  await archive.finalize();
}

module.exports = { streamFile, streamFolderAsZip };
