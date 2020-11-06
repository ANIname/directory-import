const { readdir, stat } = require('fs');
const { promisify }     = require('util');
const Promise           = require('bluebird');

const readdirAsync = promisify(readdir);
const statAsync    = promisify(stat);

async function directoryReaderAsync(directoryPath, includeSubdirectories) {
  const receivedItems       = await readdirAsync(directoryPath);
  const receivedDirectories = [];
  const receivedFiles       = [];

  await Promise.each(receivedItems, async (receivedItemName) => {
    const itemPath    = `${directoryPath}/${receivedItemName}`;
    const status      = await statAsync(itemPath);
    const isDirectory = status.isDirectory();

    if (isDirectory) {
      receivedDirectories.push(itemPath);
    }

    else {
      receivedFiles.push(itemPath);
    }
  });

  if (includeSubdirectories) {
    await Promise.each(receivedDirectories, async (receivedDirectoryPath) => {
      const files = await directoryReaderAsync(receivedDirectoryPath, includeSubdirectories);

      receivedFiles.push(...files);
    });
  }

  return receivedFiles;
}

module.exports = directoryReaderAsync;
