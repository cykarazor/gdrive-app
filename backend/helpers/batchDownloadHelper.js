const archiver = require('archiver');
const { streamFolderAsZip } = require('./downloadHelper');

async function streamMultipleFilesAndFolders(drive, fileIds, res) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => { throw err; });
  archive.pipe(res);

  for (const file of fileIds) {
    const meta = await drive.files.get({
      fileId: file,
      fields: 'id, name, mimeType',
      supportsAllDrives: true,
    }).then(r => r.data);

    if (meta.mimeType === 'application/vnd.google-apps.folder') {
      await streamFolderAsZip(drive, file, archive, meta.name);
    } else {
      const fileStream = await drive.files.get(
        { fileId: file, alt: 'media', supportsAllDrives: true },
        { responseType: 'stream' }
      ).then(r => r.data);

      archive.append(fileStream, { name: meta.name });
    }
  }

  await archive.finalize();
}

module.exports = { streamMultipleFilesAndFolders };
