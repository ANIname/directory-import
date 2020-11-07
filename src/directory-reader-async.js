const fs      = require('fs');
const util    = require('util');
const Promise = require('bluebird');

const readdirAsync = util.promisify(fs.readdir);
const statAsync    = util.promisify(fs.stat);

async function directoryReaderAsync(options) {
  const {
    targetDirectoryPath,
    lastSubDirectoryPath,
    includeSubdirectories,
    limit,
  } = options;

  const directoryPath = lastSubDirectoryPath || targetDirectoryPath;

  if (typeof options.receivedFilesLength !== 'number') {
    options.receivedFilesLength = 0;
  }

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

      options.receivedFilesLength += 1;
    }

    // Stop loop if module limit is reached
    if (options.limit && options.receivedFilesLength >= limit) {
      throw { code: 'filesLimitReached' };
    }
  }).catch(errorHandler);

  if (includeSubdirectories) {
    await Promise.each(receivedDirectories, async (receivedDirectoryPath) => {
      // Stop loop if module limit is reached
      if (options.limit && options.receivedFilesLength >= limit) {
        throw { code: 'filesLimitReached' };
      }

      options.lastSubDirectoryPath = receivedDirectoryPath;

      const files = await directoryReaderAsync(options);

      receivedFiles.push(...files);
    }).catch(errorHandler);
  }

  return receivedFiles;
}

function errorHandler(error) {
  if (error.code === 'filesLimitReached') {
    return true;
  }

  throw error;
}

module.exports = directoryReaderAsync;
