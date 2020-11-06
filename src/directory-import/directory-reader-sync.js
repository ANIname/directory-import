const path    = require('path');
const fs      = require('fs');
const forEach = require('lodash.foreach');

const { readdirSync, statSync } = fs;

function directoryReaderSync(options) {
  const { directoryPath, includeSubdirectories, limit } = options;

  if (typeof options.receivedFilesLength !== 'number') {
    options.receivedFilesLength = 0;
  }

  const receivedItems       = readdirSync(directoryPath);
  const receivedDirectories = [];
  const receivedFiles       = [];

  forEach(receivedItems, (receivedItemName) => {
    const itemPath    = path.resolve(`${directoryPath}/${receivedItemName}`);
    const status      = statSync(itemPath);
    const isDirectory = status.isDirectory();

    if (isDirectory) {
      receivedDirectories.push(itemPath);
    }

    else {
      receivedFiles.push(itemPath);

      options.receivedFilesLength += 1;
    }

    if (options.limit && options.receivedFilesLength >= limit) {
      return false;
    }
  });

  if (includeSubdirectories) {
    forEach(receivedDirectories, (receivedDirectoryPath) => {
      if (options.limit && options.receivedFilesLength >= limit) {
        return false;
      }

      options.directoryPath = receivedDirectoryPath;

      const files = directoryReaderSync(options);

      receivedFiles.push(...files);
    });
  }

  return receivedFiles;
}

module.exports = directoryReaderSync;
