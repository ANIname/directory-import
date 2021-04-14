const path                  = require('path');
const lodashEach            = require('lodash.foreach');
const Promise               = require('bluebird');
const syncDirectoryReader   = require('./directory-reader-sync');
const asyncDirectoryReader  = require('./directory-reader-async');
const validImportExtensions = require('../config/valid-import-extensions.json');

function importModules(args, callback) {
  const {
    targetDirectoryPath,
    importMethod,
    exclude,
    webpack,
  } = args;

  const modules = {};

  const handlers = { sync: syncHandler, async: asyncHandler };

  if (!handlers[importMethod]) {
    throw new Error(`Expected sync or async import method, but got: ${importMethod}`);
  }

  return handlers[importMethod]();

  function syncHandler() {
    const filesPaths = syncDirectoryReader(args);

    lodashEach(filesPaths, importModule);

    return modules;
  }

  async function asyncHandler() {
    const filesPaths = await asyncDirectoryReader(args);

    await Promise.each(filesPaths, importModule);

    return modules;
  }

  function importModule(filePath) {
    const { name: fileName, ext: fileExtension } = path.parse(filePath);
    const isValidExtension                       = validImportExtensions[fileExtension];

    if (!isValidExtension) {
      return;
    }

    const relativeModulePath = webpack
      ? `./functions/${filePath}`.slice(targetDirectoryPath.length)
      : filePath.slice(targetDirectoryPath.length);

    const excludeSpecified = typeof exclude.test === 'function';

    if (excludeSpecified) {
      const fileIsNotExcluded = !exclude.test(relativeModulePath);

      if (!fileIsNotExcluded) {
        return;
      }
    }

    const importedModuleData = webpack
      ? require(`functions/` + filePath)
      : require(filePath);

    modules[relativeModulePath] = importedModuleData;

    if (callback) {
      callback(fileName, relativeModulePath, importedModuleData);
    }
  }
}

module.exports = importModules;
