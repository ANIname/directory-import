import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { directoryImport } from '../src';
import { ImportedModulesPublicOptions } from '../src/types.d';
import {
  DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY,
  DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY,
  DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY,
  DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
} from './constants';

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
  writeFileSync(`${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`, "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World Changed!' };\n");

  // re-import the modules
  const result2 = directoryImport({
    targetDirectoryPath: DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    forceReload: false,
  });

  expect(result2).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
  // revert the content of sample-file-2.js
  writeFileSync(`${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`, "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World!' };\n");
});

test('Import modules without cache', () => {
  const result = directoryImport(DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY)

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);

  // change the content of sample-file-2.js
  writeFileSync(`${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`, "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World Changed!' };\n");

  jest.resetModules();

  // re-import the modules
  const result2 = directoryImport({
    targetDirectoryPath: DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    forceReload: true,
  });

  expect(result2['/sample-file-2.js']).toEqual({ testData: 'Hello World Changed!' });

  // revert the content of sample-file-2.js
  writeFileSync(`${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`, "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World!' };\n");
});

test('forceReload does not retain previous module instances on the importer', () => {
  const rootDirectoryPath = mkdtempSync(join(tmpdir(), 'directory-import-reload-'));
  const targetDirectoryPath = join(rootDirectoryPath, 'modules');
  const pluginFilePath = join(targetDirectoryPath, 'plugin.js');
  // eslint-disable-next-line unicorn/prefer-module
  const distPath = join(__dirname, '../dist/index.js');

  mkdirSync(targetDirectoryPath);
  writeFileSync(pluginFilePath, 'module.exports = { id: 1 };\n');

  const script = `
    const { directoryImport } = require(${JSON.stringify(distPath)});
    const pluginFilePath = ${JSON.stringify(pluginFilePath)};
    const targetDirectoryPath = ${JSON.stringify(targetDirectoryPath)};

    directoryImport({ targetDirectoryPath: targetDirectoryPath, forceReload: true });

    const parentModule = require.cache[pluginFilePath].parent;

    for (let reloadIndex = 0; reloadIndex < 5; reloadIndex += 1) {
      require('fs').writeFileSync(pluginFilePath, 'module.exports = { id: ' + (reloadIndex + 2) + ' };\\n');
      directoryImport({ targetDirectoryPath: targetDirectoryPath, forceReload: true });
    }

    const retainedPluginModules = parentModule.children.filter(function (childModule) {
      return childModule.filename === pluginFilePath;
    });

    console.log(JSON.stringify({
      retainedCount: retainedPluginModules.length,
      id: require.cache[pluginFilePath].exports.id,
    }));
  `;

  try {
    const result = execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' });

    expect(JSON.parse(result)).toEqual({ retainedCount: 1, id: 6 });
  } finally {
    rmSync(rootDirectoryPath, { force: true, recursive: true });
  }
});
