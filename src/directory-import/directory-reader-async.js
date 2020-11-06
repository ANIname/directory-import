const fs      = require('fs');
const path    = require('path');
const util    = require('util');
const Promise = require('bluebird');

const readdirAsync = util.promisify(fs.readdir);
const statAsync    = util.promisify(fs.stat);

async function directoryReaderAsync(options) {
  const { directoryPath, includeSubdirectories, limit } = options;

  if (typeof options.receivedFilesLength !== 'number') {
    options.receivedFilesLength = 0;
  }

  const receivedItems       = await readdirAsync(directoryPath);
  const receivedDirectories = [];
  const receivedFiles       = [];

  await Promise.each(receivedItems, async (receivedItemName) => {
    const itemPath    = path.resolve(`${directoryPath}/${receivedItemName}`);
    const status      = await statAsync(itemPath);
    const isDirectory = status.isDirectory();

    if (isDirectory) {
      receivedDirectories.push(itemPath);
    }

    else {
      receivedFiles.push(itemPath);

      options.receivedFilesLength += 1;
    }

    if (options.limit && options.receivedFilesLength >= limit) {
      throw { code: 'filesLimitReached' };
    }
  }).catch(errorHandler);

  if (includeSubdirectories) {
    await Promise.each(receivedDirectories, async (receivedDirectoryPath) => {
      if (options.limit && options.receivedFilesLength >= limit) {
        throw { code: 'filesLimitReached' };
      }

      options.directoryPath = receivedDirectoryPath;

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
