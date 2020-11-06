const merge         = require('lodash.merge');
const importModules = require('./import-modules');
const defaultValues = require('../../config/default-values');

/**
 * Module will allow you to synchronously or asynchronously import (requires) all modules from the folder you specify.
 *
 * You can use modules from the returned object, or you can invoke function per file
 *
 * {@link https://www.npmjs.com/package/directory-import#examples|Examples}
 * {@link https://www.npmjs.com/package/directory-import#examples|Sanbox}
 * {@link https://www.npmjs.com/package/directory-import#help|Need more help?}
 *
 * @param {Object}           [options] Config options
 * @param {String}           [options.directoryPath]         {@link https://www.npmjs.com/package/directory-import#directoryPath|More}
 * @param {('sync'|'async')} [options.importMethod]          {@link https://www.npmjs.com/package/directory-import#importMethod|More}
 * @param {Boolean}          [options.includeSubdirectories] {@link https://www.npmjs.com/package/directory-import#includeSubdirectories|More}
 * @param {String}           [options.debug]                 {@link https://www.npmjs.com/package/directory-import#debug|More} // TODO
 * @param {Number}           [options.limit]                 {@link https://www.npmjs.com/package/directory-import#debug|More} // TODO
 * @param {RegExp}           [options.exclude]               {@link https://www.npmjs.com/package/directory-import#debug|More} // TODO
 *
 * @param {Function}         [callback] The function invoked per file {@link https://www.npmjs.com/package/directory-import#examplesWithCallback|Example}

 * @returns {Object|Promise<Object>} imported modules
 *
 * @author KiiDii <kiidii@aniname.com>
 */
function directoryImport(options = {}, callback) {
  const args = merge(defaultValues, options);

  return importModules(args, callback);
}

module.exports = directoryImport;
