const path                  = require('path');
const lodashEach            = require('lodash.foreach');
const Promise               = require('bluebird');
const syncDirectoryReader   = require('./directory-reader-sync');
const asyncDirectoryReader  = require('./directory-reader-async');
const validImportExtensions = require('../../config/valid-import-extensions');

function importModules(args, callback) {
  const { directoryPath, importMethod, exclude } = args;

  const modules = {};

  const absoluteDirectoryPath = path.resolve(module.parent.path, directoryPath);
  const handlers              = { sync: syncHandler, async: asyncHandler };

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

    if (isValidExtension) {
      const relativeModulePath = filePath.slice(absoluteDirectoryPath.length);
      const fileIsNotExcluded  = !exclude.test(relativeModulePath);

      if (fileIsNotExcluded) {
        const importedModuleData = require(filePath);

        modules[relativeModulePath] = importedModuleData;

        if (callback) {
          callback(fileName, relativeModulePath, importedModuleData);
        }
      }
    }
  }
}

module.exports = importModules;
