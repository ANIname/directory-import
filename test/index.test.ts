import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { directoryImport } from '../src';
import { ImportedModulesPublicOptions } from '../src/types.d';
import {
  DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY,
  DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY,
  DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY,
  DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
} from './constants';
import fs from 'fs';

test('Import modules from the default (current) directory synchronously', () => {
  const result = directoryImport();

  expect(result).toEqual({
    '/index.test.ts': {},
    '/constants.ts': {
      DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
      DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY,
      DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY,
      DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY,
    },
  });
});

test('Import modules from the default (current) directory synchronously and call the provided callback for each imported module', () => {
  const callbackResults: unknown[] = [];

  const result = directoryImport((moduleName, modulePath, moduleContent, index) => {
    callbackResults.push({ moduleName, modulePath, moduleContent, index });
  });

  expect(result).toEqual({
    '/index.test.ts': {},
    '/constants.ts': {
      DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
      DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY,
      DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY,
      DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY,
    },
  });

  expect(callbackResults).toEqual([
    {
      index: 0,
      moduleName: 'constants',
      modulePath: '/constants.ts',
      moduleContent: {
        DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
        DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY,
        DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY,
        DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY,
      },
    },
    {
      index: 1,
      moduleName: 'index.test',
      modulePath: '/index.test.ts',
      moduleContent: {},
    },
  ]);
});

test('Import modules from the specified directory (relative path) synchronously', () => {
  const result = directoryImport(DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY);

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
});

test('Import modules from the specified directory (absolute path) synchronously', () => {
  const result = directoryImport(DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY);

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
});

test('Import modules from the specified directory (relative path) synchronously and call the provided callback for each imported module', () => {
  const callbackResults: unknown[] = [];

  const result = directoryImport(
    DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    (moduleName, modulePath, moduleContent, index) => {
      callbackResults.push({ moduleName, modulePath, moduleContent, index });
    },
  );

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
  expect(callbackResults).toEqual(DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY);
});

test('Import modules from the specified directory (absolute path) synchronously and call the provided callback for each imported module', () => {
  const callbackResults: unknown[] = [];

  const result = directoryImport(
    DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY,
    (moduleName, modulePath, moduleContent, index) => {
      callbackResults.push({ moduleName, modulePath, moduleContent, index });
    },
  );

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
  expect(callbackResults).toEqual(DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY);
});

test('Import modules from the specified directory & set synchronously mode', () => {
  const result = directoryImport(DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY, 'sync');

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
});

test('Import modules from the specified directory & set asynchronously mode', async () => {
  const result = directoryImport(DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY, 'async');

  expect(result).toBeInstanceOf(Promise);
  expect(await result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
});

test('Import modules from the specified directory & set synchronously mode and call the provided callback for each imported module', () => {
  const callbackResults: unknown[] = [];

  const result = directoryImport(
    DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    'sync',
    (moduleName, modulePath, moduleContent, index) => {
      callbackResults.push({ moduleName, modulePath, moduleContent, index });
    },
  );

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
  expect(callbackResults).toEqual(DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY);
});

test('Import modules from the specified directory & set asynchronously mode and call the provided callback for each imported module', async () => {
  const callbackResults: unknown[] = [];

  const result = directoryImport(
    DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    'async',
    (moduleName, modulePath, moduleContent, index) => {
      callbackResults.push({ moduleName, modulePath, moduleContent, index });
    },
  );

  expect(result).toBeInstanceOf(Promise);
  expect(callbackResults).toEqual([]);
  expect(await result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
  expect(callbackResults).toEqual([
    {
      moduleName: 'empty-file',
      modulePath: '/directory-with-some-modules/empty-file.js',
      moduleContent: {},
      index: 0,
    },
    {
      moduleName: 'sample-sub-file',
      modulePath: '/directory-with-some-modules/sample-sub-file.js',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      moduleContent: expect.any(Function),
      index: 1,
    },
    {
      moduleName: 'sample-file-1',
      modulePath: '/sample-file-1.ts',
      moduleContent: { default: 'This is first sampleFile' },
      index: 2,
    },
    {
      moduleName: 'sample-file-2',
      modulePath: '/sample-file-2.js',
      moduleContent: { testData: 'Hello World!' },
      index: 3,
    },
    {
      moduleName: 'sample-file-3',
      modulePath: '/sample-file-3.json',
      moduleContent: { serverHost: '0.0.0.0', serverPort: 3000 },
      index: 4,
    },
  ]);
});

test('Import modules with specified options with import pattern', async () => {
  const options: ImportedModulesPublicOptions = {
    targetDirectoryPath: DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    includeSubdirectories: false,

    // import only files ending with .js or .ts
    importPattern: /.*\.json$/,
    importMode: 'async',
  };

  const result = directoryImport(options);

  expect(result).toBeInstanceOf(Promise);
  expect(await result).toEqual({ '/sample-file-3.json': { serverHost: '0.0.0.0', serverPort: 3000 } });
});

test('Import modules with specified options with import limit', () => {
  const options: ImportedModulesPublicOptions = {
    targetDirectoryPath: DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    includeSubdirectories: false,

    // import only files ending with .js or .ts
    importPattern: /.*\.json$/,
    limit: 1,
  };

  const result = directoryImport(options);

  expect(result).toEqual({ '/sample-file-3.json': { serverHost: '0.0.0.0', serverPort: 3000 } });
});

test('Import modules with specified options and call the provided callback for each imported module', () => {
  const options: ImportedModulesPublicOptions = {
    targetDirectoryPath: DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY,
  };

  const callbackResults: unknown[] = [];

  const result = directoryImport(options, (moduleName, modulePath, moduleContent, index) => {
    callbackResults.push({ moduleName, modulePath, moduleContent, index });
  });

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
  expect(callbackResults).toEqual(DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY);
});

test('Import modules with cache', () => {
  const result = directoryImport(DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY)

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);

  // change the content of sample-file-2.js
  fs.writeFileSync(`${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`, "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World Changed!' };\n");

  // re-import the modules
  const result2 = directoryImport({
    targetDirectoryPath: DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    forceReload: false,
  });

  expect(result2).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
  // revert the content of sample-file-2.js
  fs.writeFileSync(`${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`, "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World!' };\n");
});

test('Import modules without cache', () => {
  const result = directoryImport(DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY)

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);

  // change the content of sample-file-2.js
  fs.writeFileSync(`${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`, "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World Changed!' };\n");

  jest.resetModules();

  // re-import the modules
  const result2 = directoryImport({
    targetDirectoryPath: DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    forceReload: true,
  });

  expect(result2['/sample-file-2.js']).toEqual({ testData: 'Hello World Changed!' });

  // revert the content of sample-file-2.js
  fs.writeFileSync(`${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`, "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World!' };\n");
});

test('forceReload does not re-enter modules that are still loading', () => {
  const rootDirectoryPath = fs.mkdtempSync(path.join(tmpdir(), 'directory-import-inflight-'));
  const distPath = path.join(__dirname, '../dist/index.js');
  const mainFilePath = path.join(rootDirectoryPath, 'main.js');
  const siblingFilePath = path.join(rootDirectoryPath, 'sibling.js');

  fs.writeFileSync(
    siblingFilePath,
    [
      `const { directoryImport } = require(${JSON.stringify(distPath)});`,
      "console.log('SIBLING_START');",
      'const importedModules = directoryImport({ targetDirectoryPath: __dirname, forceReload: true, includeSubdirectories: false });',
      "console.log('SIBLING_KEYS', Object.keys(importedModules).sort().join(','));",
      'module.exports = { from: "sibling" };',
      "console.log('SIBLING_END');",
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    mainFilePath,
    [
      `const { directoryImport } = require(${JSON.stringify(distPath)});`,
      "console.log('MAIN_START');",
      "require('./sibling.js');",
      'const importedModules = directoryImport({ targetDirectoryPath: __dirname, forceReload: true, includeSubdirectories: false });',
      "console.log('MAIN_KEYS', Object.keys(importedModules).sort().join(','));",
      "console.log('MAIN_END');",
      '',
    ].join('\n'),
  );

  try {
    const output = execFileSync(process.execPath, [mainFilePath], { encoding: 'utf8' });

    expect(output).toContain('MAIN_END');
    expect(output).toContain('SIBLING_END');
    expect(output).toContain('MAIN_KEYS /main.js,/sibling.js');
  } finally {
    fs.rmSync(rootDirectoryPath, { force: true, recursive: true });
  }
});

test('async forceReload does not loop when imported modules reload the same directory', () => {
  const rootDirectoryPath = fs.mkdtempSync(path.join(tmpdir(), 'directory-import-async-reload-'));
  const distPath = path.join(__dirname, '../dist/index.js');
  const mainFilePath = path.join(rootDirectoryPath, 'main.js');
  const siblingFilePath = path.join(rootDirectoryPath, 'sibling.js');
  const reloadOptions =
    'directoryImport({ targetDirectoryPath: __dirname, forceReload: true, includeSubdirectories: false, importMode: "async" })';

  fs.writeFileSync(
    siblingFilePath,
    [
      `const { directoryImport } = require(${JSON.stringify(distPath)});`,
      "console.log('SIBLING_START');",
      `${reloadOptions}.then((importedModules) => {`,
      "  console.log('SIBLING_KEYS', Object.keys(importedModules).sort().join(','));",
      "  console.log('SIBLING_END');",
      '}).catch((error) => { console.error(error); process.exitCode = 1; });',
      'module.exports = { from: "sibling" };',
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    mainFilePath,
    [
      `const { directoryImport } = require(${JSON.stringify(distPath)});`,
      "console.log('MAIN_START');",
      "require('./sibling.js');",
      `${reloadOptions}.then((importedModules) => {`,
      "  console.log('MAIN_KEYS', Object.keys(importedModules).sort().join(','));",
      "  console.log('MAIN_END');",
      '}).catch((error) => { console.error(error); process.exitCode = 1; });',
      '',
    ].join('\n'),
  );

  try {
    const output = execFileSync(process.execPath, [mainFilePath], { encoding: 'utf8', timeout: 3000 });
    const mainStartCount = output.split('MAIN_START').length - 1;

    expect(output).toContain('MAIN_END');
    expect(output).toContain('SIBLING_END');
    expect(output).toContain('MAIN_KEYS /main.js,/sibling.js');
    expect(mainStartCount).toBeLessThanOrEqual(2);
  } finally {
    fs.rmSync(rootDirectoryPath, { force: true, recursive: true });
  }
});

test('forceReload still refreshes modules that have finished loading', () => {
  const rootDirectoryPath = fs.mkdtempSync(path.join(tmpdir(), 'directory-import-reload-'));
  const pluginDirectoryPath = path.join(rootDirectoryPath, 'plugins');
  const appFilePath = path.join(rootDirectoryPath, 'app.js');
  const distPath = path.join(__dirname, '../dist/index.js');

  fs.mkdirSync(pluginDirectoryPath);
  fs.writeFileSync(
    appFilePath,
    [
      "const fs = require('node:fs');",
      "const path = require('node:path');",
      `const { directoryImport } = require(${JSON.stringify(distPath)});`,
      `const pluginDirectoryPath = ${JSON.stringify(pluginDirectoryPath)};`,
      "const pluginFilePath = path.join(pluginDirectoryPath, 'plugin.js');",
      "fs.writeFileSync(pluginFilePath, 'module.exports = { value: 1 };\\n');",
      'const firstImport = directoryImport({ targetDirectoryPath: pluginDirectoryPath, forceReload: true });',
      "fs.writeFileSync(pluginFilePath, 'module.exports = { value: 2 };\\n');",
      'const secondImport = directoryImport({ targetDirectoryPath: pluginDirectoryPath, forceReload: true });',
      "console.log(JSON.stringify({ first: firstImport['/plugin.js'].value, second: secondImport['/plugin.js'].value }));",
      '',
    ].join('\n'),
  );

  try {
    const output = execFileSync(process.execPath, [appFilePath], { encoding: 'utf8' });

    expect(JSON.parse(output)).toEqual({ first: 1, second: 2 });
  } finally {
    fs.rmSync(rootDirectoryPath, { force: true, recursive: true });
  }
});