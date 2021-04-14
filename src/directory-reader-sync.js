const fs      = require('fs');
const forEach = require('lodash.foreach');

const { readdirSync, statSync } = fs;

function directoryReaderSync(options) {
  const {
    rootDirectoryName,
    targetDirectoryPath,
    lastSubDirectoryPath,
    includeSubdirectories,
    webpack,
    limit,
  } = options;

  const directoryPath = lastSubDirectoryPath || targetDirectoryPath;

  if (typeof options.receivedFilesLength !== 'number') {
    options.receivedFilesLength = 0;
  }

  const receivedItems       = readdirSync(directoryPath);
  const receivedDirectories = [];
  const receivedFiles       = [];

  forEach(receivedItems, (receivedItemName) => {
    const itemPath    = `${directoryPath}/${receivedItemName}`;
    const status      = statSync(itemPath);
    const isDirectory = status.isDirectory();

    if (isDirectory) {
      receivedDirectories.push(itemPath);
    }

    else {
      const filePath = webpack ? itemPath.replace(`./${rootDirectoryName}/`, '') : itemPath;

      receivedFiles.push(filePath);

      options.receivedFilesLength += 1;
    }

    // Stop loop if module limit is reached
    if (options.limit && options.receivedFilesLength >= limit) {
      return false;
    }
  });

  if (includeSubdirectories) {
    forEach(receivedDirectories, (receivedDirectoryPath) => {
      // Stop loop if module limit is reached
      if (options.limit && options.receivedFilesLength >= limit) {
        return false;
      }

      options.lastSubDirectoryPath = receivedDirectoryPath;

      const files = directoryReaderSync(options);

      receivedFiles.push(...files);
    });
  }

  return receivedFiles;
}

module.exports = directoryReaderSync;
