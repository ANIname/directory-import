const { readdirSync, statSync } = require('fs');
const forEach                   = require('lodash.foreach');

function directoryReaderSync(directoryPath, includeSubdirectories) {
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
      receivedFiles.push(itemPath);
    }
  });

  if (includeSubdirectories) {
    forEach(receivedDirectories, (receivedDirectoryPath) => {
      const files = directoryReaderSync(receivedDirectoryPath, includeSubdirectories);

      receivedFiles.push(...files);
    });
  }

  return receivedFiles;
}

module.exports = directoryReaderSync;
