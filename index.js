'use strict';

const {parse, sep} = require('path');
const readdir = require('recursive-dir-reader');

/**
 * Automatic require modules from the directory
 *
 * It's possible either to use modules from the returned object, or to execute a callback at each iteration
 *
 * @param {string} dir - A path to a directory
 * @param {string} method - Sync or Async require modules
 * @param {function|undefined} callback - Calls the function one time for each item in the folder.
 * @return {{
 *   name: string,
 *   func: function
 * }} modules - Required modules
 */
module.exports = (dir, method, callback = undefined) => {
  if (method !== 'sync' && method !== 'async') {
    throw new Error('Expected sync, or async method!');
  }

  if (callback && typeof callback !== 'function') {
    throw new Error('Expected callback function');
  }

  let modules = {};

  readdir[method](dir, path => {
    const {name, ext} = parse(path);
    const notIgnoredExt =
      ext === '.js' ||
      ext === '.json';

    if (notIgnoredExt) {
      const func = require([process.cwd(), path].join(sep));

      modules[name] = func;

      if (callback) callback(name, path, func);
    }
  });

  return modules;
};
