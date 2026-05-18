import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { directoryImport } from '../src';
import { ImportedModulesPublicOptions } from '../src/types.d';
import {
  DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY,
  DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY,
  DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY,
  DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
} from './constants';

interface TemporaryImportFixture {
  rootDirectoryPath: string;
  targetDirectoryPath: string;
}

/**
 * Create an import fixture with valid modules and symbolic links that must not be followed.
 * @returns {TemporaryImportFixture} Paths for the temporary import fixture.
 */
function createTemporaryImportFixture(): TemporaryImportFixture {
  const rootDirectoryPath = mkdtempSync(join(tmpdir(), 'directory-import-'));
  const targetDirectoryPath = join(rootDirectoryPath, 'modules');
  const outsideDirectoryPath = join(rootDirectoryPath, 'outside');
  const outsideModulePath = join(outsideDirectoryPath, 'outside.js');

  mkdirSync(targetDirectoryPath);
  mkdirSync(outsideDirectoryPath);
  writeFileSync(join(targetDirectoryPath, 'safe.js'), 'module.exports = { safe: true };\n');
  writeFileSync(outsideModulePath, 'module.exports = { outside: true };\n');
  symlinkSync(outsideModulePath, join(targetDirectoryPath, 'linked-outside.js'));
  symlinkSync(targetDirectoryPath, join(targetDirectoryPath, 'recursive-loop'), 'dir');

  return { rootDirectoryPath, targetDirectoryPath };
}

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

test('Import modules from current working directory when caller stack path cannot be resolved', () => {
  const previousStackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = 0;

  try {
    const result = directoryImport('./sample-directory');

    expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
  } finally {
    Error.stackTraceLimit = previousStackTraceLimit;
  }
});

test('Import modules synchronously without following symbolic links', () => {
  const { rootDirectoryPath, targetDirectoryPath } = createTemporaryImportFixture();

  try {
    const result = directoryImport(targetDirectoryPath);

    expect(result).toEqual({ '/safe.js': { safe: true } });
  } finally {
    rmSync(rootDirectoryPath, { force: true, recursive: true });
  }
});

test('Import modules asynchronously without following symbolic links', async () => {
  const { rootDirectoryPath, targetDirectoryPath } = createTemporaryImportFixture();

  try {
    const result = directoryImport(targetDirectoryPath, 'async');

    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual({ '/safe.js': { safe: true } });
  } finally {
    rmSync(rootDirectoryPath, { force: true, recursive: true });
  }
});

test('Import modules with cache', () => {
  const result = directoryImport(DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY);

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);

  writeFileSync(
    `${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`,
    "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World Changed!' };\n",
  );

  const result2 = directoryImport({
    targetDirectoryPath: DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    forceReload: false,
  });

  expect(result2).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);
  writeFileSync(
    `${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`,
    "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World!' };\n",
  );
});

test('Import modules without cache', () => {
  const result = directoryImport(DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY);

  expect(result).toEqual(DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY);

  writeFileSync(
    `${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`,
    "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World Changed!' };\n",
  );

  jest.resetModules();

  const result2 = directoryImport({
    targetDirectoryPath: DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
    forceReload: true,
  });

  expect(result2['/sample-file-2.js']).toEqual({ testData: 'Hello World Changed!' });

  writeFileSync(
    `${DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY}/sample-file-2.js`,
    "// eslint-disable-next-line unicorn/no-empty-file, no-undef, unicorn/prefer-module\nmodule.exports = { testData: 'Hello World!' };\n",
  );
});

test('Import modules without cache through a symlinked directory', () => {
  const builtPackagePath = resolve(__dirname, '../dist');
  const script = `
    const { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } = require('node:fs');
    const { tmpdir } = require('node:os');
    const { join } = require('node:path');
    const { directoryImport } = require(${JSON.stringify(builtPackagePath)});

    const temporaryDirectoryPath = mkdtempSync(join(tmpdir(), 'directory-import-'));
    const realDirectoryPath = join(temporaryDirectoryPath, 'real');
    const symlinkDirectoryPath = join(temporaryDirectoryPath, 'linked');
    const moduleFilePath = join(realDirectoryPath, 'sample-module.js');

    try {
      mkdirSync(realDirectoryPath);
      writeFileSync(moduleFilePath, "module.exports = { testData: 'Initial value' };\\n");
      symlinkSync(realDirectoryPath, symlinkDirectoryPath, 'dir');

      directoryImport(symlinkDirectoryPath);

      writeFileSync(moduleFilePath, "module.exports = { testData: 'Changed value' };\\n");

      const reloadedResult = directoryImport({
        targetDirectoryPath: symlinkDirectoryPath,
        forceReload: true,
      });

      process.stdout.write(JSON.stringify(reloadedResult));
    } finally {
      if (existsSync(moduleFilePath)) {
        const resolvedModuleFilePath = require.resolve(moduleFilePath);

        delete require.cache[resolvedModuleFilePath];
      }

      rmSync(temporaryDirectoryPath, { recursive: true, force: true });
    }
  `;
  const reloadedResult = JSON.parse(execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' })) as unknown;

  expect(reloadedResult).toEqual({ '/sample-module.js': { testData: 'Changed value' } });
});
