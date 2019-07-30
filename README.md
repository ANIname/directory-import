##### Module sync or async import(requires) all modules from the folder you specify.
It's possible either to use modules from the returned object, or to execute a callback at each iteration

## Installation
```
npm i directory-import
```
After install, you can require module:
```javascript
const importDir = require('directory-import');

// Code
```

## Usage
For example, we have the following directory structure:

![alt text](https://cdn.discordapp.com/attachments/413313254354583557/605707107592830976/unknown.png)

In the code below, we gave several examples of how to import all modules into "someDir" directory and all its subdirectories.
```javascript
const importDir = require('directory-import');

// EX 1
// Simple loading of all modules inside the directory and in all its subdirectories
importDir(`./someDir`, 'sync');

// EX 2
// Loading and working with all modules inside the directory and in all its subdirectories
importDir(`./someDir`, 'sync', (name, path, func) => {
  console.info(
    `name: ${name} \n` +
    `path: ${path} \n` +
    `func: ${func} \n`
  );
  
  // name: someFile1
  // path: ./someDir/someFile1.js
  // func: () => console.info('this is some file 1')
  //
  // name: someFile2
  // path: ./someDir/someFile2.js
  // func: () => console.info('this is some file 2')
  //
  // name: config
  // path: ./someDir/config.json
  // func: [object Object]
  //
  // name: someModule1
  // path: ./someDir/someSubDir/someModule1.js
  // func: () => console.info('this is some module 1')
  //
  // name: someModule2
  // path: ./someDir/someSubDir/someModule2.js
  // func: () => console.info('this is some module 2')
});

// EX 3
// The same as with the sync method above. 
// However, modules load in order from fastest loaded to slowest loaded
importDir(`./someDir`, 'async', (name, path, func) => {
  console.info(
    `name: ${name} \n` +
    `path: ${path} \n` +
    `func: ${func} \n`
  );
});

// EX 4
// Loading and storing modules in the object
const modules = importDir(`./someDir`, 'sync');

console.info(modules);
// { 
//   someFile1: [Function],
//   someFile2: [Function],
//   config: { some: 'text', author: 'kiidii' },
//   someModule1: [Function],
//   someModule2: [Function]
// }

// EX 5
// The same as with the sync method above. 
// However, modules load in order from fastest loaded to slowest loaded
const filesIntoDirAsync = readdir.async('./someDir');


setTimeout(() => {
  console.info(filesIntoDirAsync);
}, 1000);
```
You can easily combine this methods.
```javascript
const modules = importDir(`./someDir`, 'sync', (name, path, func) => {
  console.info(
    `name: ${name} \n` +
    `path: ${path} \n` +
    `func: ${func} \n`
  );
  
  // name: someFile1
  // path: ./someDir/someFile1.js
  // func: () => console.info('this is some file 1')
  //
  // name: someFile2
  // path: ./someDir/someFile2.js
  // func: () => console.info('this is some file 2')
  //
  // name: config
  // path: ./someDir/config.json
  // func: [object Object]
  //
  // name: someModule1
  // path: ./someDir/someSubDir/someModule1.js
  // func: () => console.info('this is some module 1')
  //
  // name: someModule2
  // path: ./someDir/someSubDir/someModule2.js
  // func: () => console.info('this is some module 2')
});

console.info(modules);
// { 
//   someFile1: [Function],
//   someFile2: [Function],
//   config: { some: 'text', author: 'kiidii' },
//   someModule1: [Function],
//   someModule2: [Function]
// }
```