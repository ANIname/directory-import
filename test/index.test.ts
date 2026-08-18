import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

import fs from 'fs';

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

test('Import modules from a relative directory against the runtime caller when source maps are enabled', () => {
  const compiledLibraryPath = path.resolve(__dirname, '../dist/index.js');

  expect(fs.existsSync(compiledLibraryPath)).toBe(true);

  const temporaryRootPath = fs.mkdtempSync(path.join(os.tmpdir(), 'directory-import-sourcemaps-'));

  try {
    const sourceDirectoryPath = path.join(temporaryRootPath, 'src');
    const compiledDirectoryPath = path.join(temporaryRootPath, 'dist');
    const sourcePluginsDirectoryPath = path.join(sourceDirectoryPath, 'plugins');
    const compiledPluginsDirectoryPath = path.join(compiledDirectoryPath, 'plugins');
    const compiledCallerPath = path.join(compiledDirectoryPath, 'app.js');

    fs.mkdirSync(sourcePluginsDirectoryPath, { recursive: true });
    fs.mkdirSync(compiledPluginsDirectoryPath, { recursive: true });
    fs.writeFileSync(path.join(sourceDirectoryPath, 'app.ts'), 'export {};\n');
    fs.writeFileSync(path.join(sourcePluginsDirectoryPath, 'plugin.js'), "module.exports = { origin: 'source' };\n");
    fs.writeFileSync(
      path.join(compiledPluginsDirectoryPath, 'plugin.js'),
      "module.exports = { origin: 'compiled' };\n",
    );
    fs.writeFileSync(
      compiledCallerPath,
      [
        `const { directoryImport } = require(${JSON.stringify(compiledLibraryPath)});`,
        'const importedModules = directoryImport("./plugins");',
        'process.stdout.write(JSON.stringify({ importedModules, sourceMapsEnabled: process.sourceMapsEnabled }));',
        '//# sourceMappingURL=app.js.map',
        '',
      ].join('\n'),
    );
    fs.writeFileSync(
      `${compiledCallerPath}.map`,
      JSON.stringify({
        version: 3,
        file: 'app.js',
        sources: ['../src/app.ts'],
        names: [],
        mappings: 'AAAA',
      }),
    );

    const childProcess = spawnSync(process.execPath, ['--enable-source-maps', compiledCallerPath], {
      encoding: 'utf8',
    });

    expect(childProcess.status).toBe(0);
    expect(childProcess.stderr).toBe('');
    expect(JSON.parse(childProcess.stdout)).toEqual({
      importedModules: {
        [`${path.sep}plugin.js`]: { origin: 'compiled' },
      },
      sourceMapsEnabled: true,
    });
  } finally {
    fs.rmSync(temporaryRootPath, { recursive: true, force: true });
  }
});