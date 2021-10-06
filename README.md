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
___
## Installation
```
npm i directory-import
```
After install, you can require module and import files:

```javascript
const importDir = require('directory-import');

// Returns: { filePath1: fileData1, filePath2: fileData2, ... },
const importedModules = importDir({ directoryPath: './' });
```
___
## Simple usage
This is one simple example of how to use the library and how it works under the hood:

```javascript
const importDir = require('directory-import');

const importedModules = importDir({ directoryPath: '../sample-directory' });

console.info(importedModules);
```
<a href="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example.gif">
  <img src="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example.gif?raw=true" alt="GIF how it works under the hood">
</a>

### [Path to directory from GIF above][pathToDirectoryFromGif]

### You can invoke callback on each file
This can be useful when, for example, you need to do some action depending on the imported file.

```javascript
const importDir = require('directory-import');

importDir({ directoryPath: '../sample-directory' }, (moduleName, modulePath, moduleData) => {
  console.info({ moduleName, modulePath, moduleData });
});
```
<a href="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example-with-callback.gif">
  <img src="https://github.com/KiiDii/directory-import/blob/master/media/directory-import-example-with-callback.gif?raw=true" alt="GIF how it works under the hood">
</a>

___
## Params

### {Object} Options:
|        Property        |   Type   | Default value |                          Description                          |
|------------------------|----------|---------------|---------------------------------------------------------------|
| directoryPath          | String   | "./"          | Relative path to directory                                    |
| importMethod           | String   | "sync"        | Import files synchronously, or asynchronously                 |
| includeSubdirectories  | Boolean  | true          | If false — files in subdirectories will not be imported       |
| webpack                | Boolean  | false         | Webpack support. [Example using][webpackExample]                            |
| limit                  | Number   | 0             | Indicates how many files to import. 0 - to disable the limit  |
| exclude                | RegExp   | undefined     | Exclude files paths. [Example][regex101]                      |

### {Function} Callback:
| Property |   Type   |     Description     |
|----------|----------|---------------------|
| fileName | String   | File name           |
| filePath | String   | File path           |
| fileData | String   | Exported file data  |

___
## More examples

#### Minimum code to run modules that are in the same folder as the code below:

```javascript
const importDir = require('directory-import');

importDir();
```

#### Async call:

```javascript
const importDir = require('directory-import');

const importedModules = importDir({ importMethod: 'async', directoryPath: '../sample-directory' });

// Promise { <pending> }
console.info(importedModules);
```

#### Async call with callback:

```javascript
const importDir = require('directory-import');

importDir({ importMethod: 'async', directoryPath: '../sample-directory' }, (moduleName, modulePath, moduleData) => {
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
const importDir = require('directory-import');

const importedModules = importDir({ directoryPath: '../sample-directory' }, (moduleName, modulePath, moduleData) => {
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

#### Exclude .json extension
```javascript
const importDir = require('directory-import');

const result = importDir({ directoryPath: '../sample-directory', exclude: /.json$/g });

console.info(result);
```

#### using with webpack
```javascript
// You must specify the node_modules dir. Otherwise webpak will generate an error
const importDir = require('node_modules/directory-import');
// or const importDir = require('../node_modules/directory-import');

// You must specify the path from the root directory.
// And also indicate that we want to work with the webpack (webpack: true)
const result = importDir({ directoryPath: './sample-directory', webpack: true });

console.info(result);
```

___
## Help
If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to join our official [Discord server][discordServer].

<a href="https://discord.gg/ADFYZtJ">
  <img src="https://img.shields.io/discord/219557939466338304?label=Discord%20chat%20(rus)" alt="Discord server">
</a>

Although the server was created for Russian speakers, you can also write in English! We will understand you!

[pathToDirectoryFromGif]: https://github.com/KiiDii/directory-import/tree/master/sample-directory
[regex101]: https://regex101.com/r/mp8lkk/1
[webpackExample]: https://github.com/KiiDii/directory-import#using-with-webpack
[discordServer]: https://discord.gg/ADFYZtJ
[jsFileIcon]: https://www.flaticon.com/svg/static/icons/svg/2306/2306122.svg "Logo Title Text 2"
