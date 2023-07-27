<!--suppress HtmlDeprecatedAttribute -->
<div align="center">
  <p>
    <img src="https://img.shields.io/node/v/directory-import" alt="Node version required">
    <img src="https://img.shields.io/github/languages/code-size/KiiDii/directory-import" alt="GitHub code size">
    <img src="https://img.shields.io/npm/dt/directory-import" alt="Downloads">
    <a href="https://discord.gg/ADFYZtJ">
      <img src="https://img.shields.io/discord/219557939466338304?label=Discord%20chat%20(rus)" alt="Discord server">
    </a>
  </p>
  <p>
    <a href="https://nodei.co/npm/directory-import">
      <img src="https://nodei.co/npm/directory-import.png?compact=true" alt="Install directory-import from npm">
    </a>
  </p>
</div>

## About

Module will allow you to synchronously or asynchronously import (requires) all modules from the folder you specify.

You can use modules from the returned object, or you can invoke function per file

---

## Installation

```
npm i directory-import
```

After install, you can require module and import files:

```javascript
const { directoryImport } = require('directory-import');

// Returns: { filePath1: fileData1, filePath2: fileData2, ... },
const importedModules = directoryImport('./');
```

---

## Simple usage

This is one simple example of how to use the library and how it works under the hood:

```javascript
const { directoryImport } = require('directory-import');

const importedModules = directoryImport('../sample-directory');

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

directoryImport('../sample-directory', (moduleName, modulePath, moduleData) => {
  console.info({ moduleName, modulePath, moduleData });
});
```

<a href="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example-with-callback.gif">
  <img src="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example-with-callback.gif?raw=true" alt="GIF how it works under the hood">
</a>

---

### {Function} Callback:

| Property | Type   | Description        |
| -------- | ------ | ------------------ |
| fileName | String | File name          |
| filePath | String | File path          |
| fileData | String | Exported file data |
| index    | Number | The module index   |

---

## More examples

#### Minimum code to run modules that are in the same folder as the code below:

```javascript
const { directoryImport } = require('directory-import');

directoryImport();
```

#### Async call:

```javascript
const { directoryImport } = require('directory-import');

const importedModules = directoryImport('../sample-directory', 'async');

// Promise { <pending> }
console.info(importedModules);
```

#### Async call with callback:

```javascript
const { directoryImport } = require('directory-import');

directoryImport('../sample-directory', 'async', (moduleName, modulePath, moduleData) => {
  // {
  //   moduleName: 'sample-file-1',
  //   modulePath: '/sample-file-1.js',
  //   moduleData: 'This is first sampleFile'
  // }
  // ...
  console.info({ moduleName, modulePath, moduleData });
});
```

#### Put the result in a variable and invoke a callback for each module

```javascript
const { directoryImport } = require('directory-import');

const importedModules = directoryImport('../sample-directory', (moduleName, modulePath, moduleData) => {
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

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to join our official [Discord server][discordServer].

<a href="https://discord.gg/ADFYZtJ">
  <img src="https://img.shields.io/discord/219557939466338304?label=Discord%20chat" alt="Discord server">
</a>

[pathToDirectoryFromGif]: https://github.com/KiiDii/directory-import/tree/master/sample-directory
[regex101]: https://regex101.com/r/mp8lkk/1
[webpackExample]: https://github.com/KiiDii/directory-import#using-with-webpack
[discordServer]: https://discord.gg/ADFYZtJ
[jsFileIcon]: https://www.flaticon.com/svg/static/icons/svg/2306/2306122.svg 'Logo Title Text 2'
