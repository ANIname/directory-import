<!--suppress HtmlDeprecatedAttribute -->
<div align="center">
  <p>
    <img src="https://img.shields.io/node/v/directory-import" alt="Node version required">
    <img src="https://img.shields.io/github/languages/code-size/KiiDii/directory-import" alt="GitHub code size">
    <img src="https://img.shields.io/npm/dt/directory-import" alt="Downloads">
    <a href="https://discord.gg/ADFYZtJ">
      <img src="https://img.shields.io/discord/219557939466338304?label=Discord%20chat" alt="Discord server">
    </a>
  </p>
  <p>
    <a href="https://nodei.co/npm/directory-import">
      <img src="https://nodei.co/npm/directory-import.png?compact=true" alt="Install directory-import from npm">
    </a>
  </p>
</div>

## About

Module for automatic import of files from a directory and subdirectories (sync and async).
You can use imported modules either from the returned object or in the callback function.

---

## Installation

```bash
npm install directory-import
```

After installation, you can use the module in your project:

```js
const { directoryImport } = require('directory-import');

const importedModules = directoryImport('./path/to/directory');

// Will output an object with imported modules
// For example: { modulePath1: module1, modulePath2: module2, ... }
console.log(importedModules);
```

or:

```ts
import { directoryImport } from 'directory-import';

const importedModules = directoryImport('./path/to/directory');

// Will output an object with imported modules
// For example: { modulePath1: module1, modulePath2: module2, ... }
console.log(importedModules);
```

---

## Simple usage

This is one simple example of how to use the library and how it works under the hood:

```javascript
const { directoryImport } = require('directory-import');

const importedModules = directoryImport('./sample-directory');

console.info(importedModules);
```

<a href="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example.gif">
  <img src="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example.gif?raw=true" alt="GIF how it works under the hood">
</a>

### [Path to directory from GIF above][pathToDirectoryFromGif]

### You can invoke callback on each file

This can be useful when, for example, you need to do some action depending on the imported file.

```javascript
const { directoryImport } = require('directory-import');

directoryImport('./sample-directory', (moduleName, modulePath, moduleData) => {
  console.info({ moduleName, modulePath, moduleData });
});
```

<a href="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example-with-callback.gif">
  <img src="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example-with-callback.gif?raw=true" alt="GIF how it works under the hood">
</a>

### {Function} Callback properties:

| Property | Type   | Description                                                  |
| -------- | ------ | ------------------------------------------------------------ |
| name     | String | Module name based on file name                               |
| path     | String | Relative module path                                         |
| data     | String | Exported data of the module. (Ex: "module.exports = 'test'") |
| index    | Number | Imported module index                                        |

### {Object} Options properties:

| Property              | Type    | Description                                               |
| --------------------- | ------- | --------------------------------------------------------- |
| includeSubdirectories | Boolean | If true, the module will import files from subdirectories |
| targetDirectoryPath   | String  | The path to the directory to import modules from          |
| importPattern         | RegExp  | RegExp pattern to filter files                            |
| importMode            | String  | The import mode. Can be 'sync' or 'async'                 |
| limit                 | Number  | Limit the number of imported modules                      |

---

### More examples:

Minimum code to use:

```js
const { directoryImport } = require('directory-import');

// Will synchronously import all files in the same directory as the code was called
directoryImport();
```

Asynchronously import files from the specified directory:

```js
const { directoryImport } = require('directory-import');

const result = directoryImport('./path/to/directory', 'async');

// Promise { <pending> }
console.log(result);
```

Put result in a variable and invoce callback on each file:

```js
const { directoryImport } = require('directory-import');

const importedModules = directoryImport('./path/to/directory', (moduleName, modulePath, moduleData) => {
  // {
  //   moduleName: 'sample-file-1',
  //   modulePath: '/sample-file-1.js',
  //   moduleData: 'This is first sampleFile'
  // }
  // ...
  console.info({ moduleName, modulePath, moduleData });
});

// {
//   '/sample-file-1.js': 'This is first sampleFile',
//   ...
// }
console.info(importedModules);
```

---

### Overloads:

```js
const { directoryImport } = require('directory-import');

/**
 * Import modules from the current directory synchronously
 * @returns {Object} An object containing all imported modules.
 */
const importedModules = directoryImport();

// {
//   '/sample-file-1.js': 'This is first sampleFile',
//   ...
// }
console.log(importedModules);
```

```js
const { directoryImport } = require('directory-import');

/**
 * Import modules from the current directory synchronously and call the provided callback for each imported module.
 * @param {Function} callback - The callback function to call for each imported module.
 * @returns {Object} An object containing all imported modules.
 */
directoryImport((moduleName, modulePath, moduleData) => {
  // {
  //   moduleName: 'sample-file-1',
  //   modulePath: '/sample-file-1.js',
  //   moduleData: 'This is first sampleFile'
  // }
  // ...
  console.info({ moduleName, modulePath, moduleData });
});
```

```js
const { directoryImport } = require('directory-import');

/**
 * Import modules from the specified directory synchronously
 * @param {String} directoryPath - The path to the directory from which you want to import modules.
 * @returns {Object} An object containing all imported modules.
 */
const importedModules = directoryImport('./path/to/directory');

// {
//   '/sample-file-1.js': 'This is first sampleFile',
//   ...
// }
console.log(importedModules);
```

```js
const { directoryImport } = require('directory-import');

/**
 * Import modules from the specified directory synchronously and call the provided callback for each imported module.
 * @param {String} directoryPath - The path to the directory from which you want to import modules.
 * @param {Function} callback - The callback function to call for each imported module.
 * @returns {Object} An object containing all imported modules.
 */
directoryImport('./path/to/directory', (moduleName, modulePath, moduleData) => {
  // {
  //   moduleName: 'sample-file-1',
  //   modulePath: '/sample-file-1.js',
  //   moduleData: 'This is first sampleFile'
  // }
  // ...
  console.info({ moduleName, modulePath, moduleData });
});
```

```js
const { directoryImport } = require('directory-import');

/**
 * Import all modules from the specified directory synchronously or asynchronously.
 * @param {string} targetDirectoryPath - The path to the directory to import modules from.
 * @param {'sync'|'async'} mode - The import mode. Can be 'sync' or 'async'.
 * @returns {Object} An object containing all imported modules.
 */
const importModules = directoryImport('./path/to/directory', 'sync');

// {
//   '/sample-file-1.js': 'This is first sampleFile',
//   ...
// }
console.log(importedModules);
```

```js
const { directoryImport } = require('directory-import');

/**
 * Import all modules from the specified directory synchronously or asynchronously and call the provided callback for each imported module.
 * @param {string} targetDirectoryPath - The path to the directory to import modules from.
 * @param {'sync'|'async'} mode - The import mode. Can be 'sync' or 'async'.
 * @param {Function} callback - The callback function to call for each imported module.
 * @returns {Object} An object containing all imported modules.
 */
directoryImport('./path/to/directory', 'sync', (moduleName, modulePath, moduleData) => {
  // {
  //   moduleName: 'sample-file-1',
  //   modulePath: '/sample-file-1.js',
  //   moduleData: 'This is first sampleFile'
  // }
  // ...
  console.info({ moduleName, modulePath, moduleData });
});
```

```js
const { directoryImport } = require('directory-import');

const options = {
  includeSubdirectories: true,
  targetDirectoryPath: './path/to/directory',
  importPattern: /\.js/,
  importMode: 'sync',
  limit: 2,
};

/**
 * Import all modules from the specified directory
 * @param {Object} targetDirectoryPath - options - The options object.
 * @returns {Object} An object containing all imported modules.
 */
const importModules = directoryImport(options);

// {
//   '/sample-file-1.js': 'This is first sampleFile',
//   ...
// }
console.log(importedModules);
```

```js
const { directoryImport } = require('directory-import');

const options = {
  includeSubdirectories: true,
  targetDirectoryPath: './path/to/directory',
  importPattern: /\.js/,
  importMode: 'sync',
  limit: 2,
};

/**
 * Import all modules from the specified directory and call the provided callback for each imported module.
 * @param {Object} targetDirectoryPath - options - The options object.
 * @param {Function} callback - The callback function to call for each imported module.
 * @returns {Object} An object containing all imported modules.
 */
directoryImport(options, (moduleName, modulePath, moduleData) => {
  // {
  //   moduleName: 'sample-file-1',
  //   modulePath: '/sample-file-1.js',
  //   moduleData: 'This is first sampleFile'
  // }
  // ...
  console.info({ moduleName, modulePath, moduleData });
});
```

---

### Help

- If you have any questions, you can ask them in the [Discord server][discordServer].
- If you find a bug, or you have any suggestions? please create an issue on [GitHub issues][gitIssues].
- If you want to help with the development of the project, you can create a pull request on [GitHub pull requests][gitPullRequests].
- If you like the project, you can put a star on [GitHub][gitProject].

[pathToDirectoryFromGif]: https://github.com/KiiDii/directory-import/tree/master/sample-directory
[discordServer]: https://discord.gg/ADFYZtJ
[gitProject]: https://github.com/ANIname/directory-import
[gitIssues]: https://github.com/ANIname/directory-import/issues
[gitPullRequests]: https://github.com/ANIname/directory-import/pulls
