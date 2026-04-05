import { directoryImport } from '../src';
import { ImportedModulesPublicOptions } from '../src/types.d';
import {
  DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY,
  DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY,
  DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY,
  DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
} from './constants';
import fs from 'fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

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

test('Import modules without cache and refresh transitive dependencies', () => {
  const projectRootPath = path.resolve(__dirname, '..');
  const sourceEntryPointPath = path.resolve(projectRootPath, 'src', 'index.ts');
  const evaluationScript = `
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = function compileTypeScript(module, filename) {
  const sourceCode = fs.readFileSync(filename, 'utf8');
  const transpileOutput = ts.transpileModule(sourceCode, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  });

  module._compile(transpileOutput.outputText, filename);
};

const { directoryImport } = require(${JSON.stringify(sourceEntryPointPath)});
const temporaryDirectoryPath = fs.mkdtempSync(path.join(os.tmpdir(), 'directory-import-force-reload-'));
const dependencyFilePath = path.join(temporaryDirectoryPath, 'dependency.js');
const parentFilePath = path.join(temporaryDirectoryPath, 'parent.js');

try {
  fs.writeFileSync(dependencyFilePath, "module.exports = { value: 'v1' };\\n");
  fs.writeFileSync(parentFilePath, "module.exports = require('./dependency.js');\\n");

  const firstImportResult = directoryImport({
    targetDirectoryPath: temporaryDirectoryPath,
    includeSubdirectories: false,
    importPattern: /parent\\\\.js$/,
    forceReload: true,
  });

  fs.writeFileSync(dependencyFilePath, "module.exports = { value: 'v2' };\\n");

  const secondImportResult = directoryImport({
    targetDirectoryPath: temporaryDirectoryPath,
    includeSubdirectories: false,
    importPattern: /parent\\\\.js$/,
    forceReload: true,
  });

  if (firstImportResult['/parent.js']?.value !== 'v1') process.exit(11);
  if (secondImportResult['/parent.js']?.value !== 'v2') process.exit(12);
} finally {
  fs.rmSync(temporaryDirectoryPath, { recursive: true, force: true });
}
`;

  const evaluationResult = spawnSync(process.execPath, ['-e', evaluationScript], {
    cwd: projectRootPath,
    encoding: 'utf8',
  });

  if (evaluationResult.status !== 0) {
    throw new Error(
      `Force reload runtime verification failed with code ${evaluationResult.status}\nstdout:\n${evaluationResult.stdout}\nstderr:\n${evaluationResult.stderr}`,
    );
  }
});