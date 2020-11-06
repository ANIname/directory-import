const merge         = require('lodash.merge');
const importModules = require('./import-modules');
const defaultValues = require('../../config/default-values');

/**
 * Module will allow you to synchronously or asynchronously import (requires) all modules from the folder you specify.
 *
 * You can use modules from the returned object, or you can invoke function per file
 *
 * {@link https://www.npmjs.com/package/directory-import#more-examples|Examples}
 * {@link https://npm.runkit.com/directory-import|Sanbox}
 * {@link https://github.com/KiiDii/directory-import#help|Need more help?}
 *
 * @param {Object}           [options] Config options
 * @param {String}           [options.directoryPath]         {@link https://github.com/KiiDii/directory-import#object-options|More}
 * @param {('sync'|'async')} [options.importMethod]          {@link https://github.com/KiiDii/directory-import#object-options|More}
 * @param {Boolean}          [options.includeSubdirectories] {@link https://github.com/KiiDii/directory-import#object-options|More}
 * @param {Number}           [options.limit]                 {@link https://github.com/KiiDii/directory-import#object-options|More}
 * @param {RegExp}           [options.exclude]               {@link https://github.com/KiiDii/directory-import#object-options|More} // TODO
 *
 * @param {Function}         [callback] The function invoked per file {@link https://www.npmjs.com/package/directory-import#you-can-invoke-callback-on-each-file|Example}

 * @returns {Object|Promise<Object>} imported modules
 *
 * @author KiiDii <kiidii@aniname.com>
 */
function directoryImport(options = {}, callback) {
  const args = merge(defaultValues, options);

  return importModules(args, callback);
}

module.exports = directoryImport;
