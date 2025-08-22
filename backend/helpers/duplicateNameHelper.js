// backend/helpers/duplicateNameHelper.js
/**
 * Generates a unique file/folder name in a folder on Google Drive
 * Appends "Copy of ..." or "Copy (2) of ..." if name already exists
 *
 * @param {object} params
 * @param {google.drive_v3.Drive} params.drive - authenticated drive instance
 * @param {string} params.parentId - folder ID to check for duplicates
 * @param {string} params.desiredName - original name
 * @returns {Promise<string>} unique name
 */
async function getUniqueFileName({ drive, parentId, desiredName }) {
  let name = desiredName;
  let counter = 0;

  while (true) {
    const res = await drive.files.list({
      q: `'${parentId}' in parents and name='${name.replace(/'/g, "\\'")}' and trashed=false`,
      fields: 'files(id)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (!res.data.files || res.data.files.length === 0) {
      return name; // unique name found
    }

    counter++;
    if (counter === 1) {
      name = `Copy of ${desiredName}`;
    } else {
      name = `Copy (${counter}) of ${desiredName}`;
    }
  }
}

module.exports = { getUniqueFileName };
