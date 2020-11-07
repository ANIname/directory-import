/* eslint-disable max-len */
const jestGlobals       = require('@jest/globals');
const importDir         = require('../../src');
const fileCallingModule = require('../helpers/file-calling-module');
const constants         = require('../helpers/constants');

const { sampleDirectoryPath } = constants;
const { describe, test      } = jestGlobals;

describe('Module main unit test', () => {
  test('Done if no params',                                doneIfNoParams);
  test('Done if call from another file',                   doneIfCallFromAnotherFile);
  test('Done with sample-directory',                       doneWithSampleDirectory);
  test('Done if async call',                               doneIfAsyncCall);
  test('Done if sync call',                                doneIfSyncCall);
  test('Done if multiply sync call',                       doneIfMultiplySyncCall);
  test('Done if multiply async call',                      doneIfMultiplyAsyncCall);
  test('Done if sync call with several limit',             doneIfSyncCallWithSeveralLimit);
  test('Done if async call with several limit',            doneIfAsyncCallWithSeveralLimit);
  test('Done if sync call with includeSubDirectories',     doneIfSyncCallWithIncludeSubDirectories);
  test('Done if async call with includeSubDirectories',    doneIfAsyncCallWithIncludeSubDirectories);
  test('Done if sync call without includeSubDirectories',  doneIfSyncCallWithoutIncludeSubDirectories);
  test('Done if async call without includeSubDirectories', doneIfAsyncCallWithoutIncludeSubDirectories);
  test('Done if sync call with exclude property',          doneIfSyncCallWithExcludeProperty);
  test('Done if async call with exclude property',         doneIfAsyncCallWithExcludeProperty);
});

function doneIfNoParams() {
  const result = importDir();

  expect(result).toEqual({ '/main.test.js': {} });
}

function doneIfCallFromAnotherFile() {
  expect(fileCallingModule).toEqual({
    '/file-calling-module.js': {},
    '/constants.js':           require('../helpers/constants'),
  });
}

async function doneWithSampleDirectory() {
  const result = importDir({ directoryPath: sampleDirectoryPath });

  expect(result).toEqual({
    '/sample-file-1.js':                               require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                             require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  });
}

async function doneIfAsyncCall() {
  const result = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'async' });

  expect(result).toEqual({
    '/sample-file-1.js':                               require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                             require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  });
}

function doneIfSyncCall() {
  const result = importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });

  expect(result).toEqual({
    '/sample-file-1.js':                               require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                             require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  });
}

function doneIfMultiplySyncCall() {
  const result1 = importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });
  const result2 = importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });
  const result3 = importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });
  const result4 = importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });
  const result5 = importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });

  const expectedResult = {
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
    '/sample-file-1.js':                               require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                             require(`${sampleDirectoryPath}/sample-file-3`),
  };

  expect(result1).toEqual(expectedResult);
  expect(result2).toEqual(expectedResult);
  expect(result3).toEqual(expectedResult);
  expect(result4).toEqual(expectedResult);
  expect(result5).toEqual(expectedResult);
}

async function doneIfMultiplyAsyncCall() {
  const result1 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });
  const result2 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });
  const result3 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });
  const result4 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });
  const result5 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync' });

  const expectedResult = {
    '/sample-file-1.js':                               require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                             require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  };

  expect(result1).toEqual(expectedResult);
  expect(result2).toEqual(expectedResult);
  expect(result3).toEqual(expectedResult);
  expect(result4).toEqual(expectedResult);
  expect(result5).toEqual(expectedResult);
}

function doneIfSyncCallWithSeveralLimit() {
  const result1 = importDir({ directoryPath: sampleDirectoryPath, limit: 5 });
  const result2 = importDir({ directoryPath: sampleDirectoryPath, limit: 4 });
  const result3 = importDir({ directoryPath: sampleDirectoryPath, limit: 3 });
  const result4 = importDir({ directoryPath: sampleDirectoryPath, limit: 2 });
  const result5 = importDir({ directoryPath: sampleDirectoryPath, limit: 1 });

  expect(result1).toEqual({
    '/sample-file-1.js':                               require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                             require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  });

  expect(result2).toEqual({
    '/sample-file-1.js':                          require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                          require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                        require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
  });

  expect(result3).toEqual({
    '/sample-file-1.js':   require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':   require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json': require(`${sampleDirectoryPath}/sample-file-3`),
  });

  expect(result4).toEqual({
    '/sample-file-1.js': require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js': require(`${sampleDirectoryPath}/sample-file-2`),
  });

  expect(result5).toEqual({
    '/sample-file-1.js': require(`${sampleDirectoryPath}/sample-file-1`),
  });
}

async function doneIfAsyncCallWithSeveralLimit() {
  const result1 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'async', limit: 1 });
  const result2 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'async', limit: 2 });
  const result3 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'async', limit: 3 });
  const result4 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'async', limit: 4 });
  const result5 = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'async', limit: 5 });

  expect(result1).toEqual({
    '/sample-file-1.js': require(`${sampleDirectoryPath}/sample-file-1.js`),
  });

  expect(result2).toEqual({
    '/sample-file-1.js': require(`${sampleDirectoryPath}/sample-file-1.js`),
    '/sample-file-2.js': require(`${sampleDirectoryPath}/sample-file-2.js`),
  });

  expect(result3).toEqual({
    '/sample-file-1.js':   require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':   require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json': require(`${sampleDirectoryPath}/sample-file-3`),
  });

  expect(result4).toEqual({
    '/sample-file-1.js':                          require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                          require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                        require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
  });

  expect(result5).toEqual({
    '/sample-file-1.js':                               require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                             require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  });
}

function doneIfSyncCallWithIncludeSubDirectories() {
  const result = importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync', includeSubdirectories: true });

  expect(result).toEqual({
    '/sample-file-1.js':                               require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                             require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  });
}

async function doneIfAsyncCallWithIncludeSubDirectories() {
  const result = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'async', includeSubdirectories: true });

  expect(result).toEqual({
    '/sample-file-1.js':                               require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json':                             require(`${sampleDirectoryPath}/sample-file-3`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  });
}

function doneIfSyncCallWithoutIncludeSubDirectories() {
  const result = importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync', includeSubdirectories: false });

  expect(result).toEqual({
    '/sample-file-1.js':   require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':   require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json': require(`${sampleDirectoryPath}/sample-file-3`),
  });
}

async function doneIfAsyncCallWithoutIncludeSubDirectories() {
  const result = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'async', includeSubdirectories: false });

  expect(result).toEqual({
    '/sample-file-1.js':   require(`${sampleDirectoryPath}/sample-file-1`),
    '/sample-file-2.js':   require(`${sampleDirectoryPath}/sample-file-2`),
    '/sample-file-3.json': require(`${sampleDirectoryPath}/sample-file-3`),
  });
}

function doneIfSyncCallWithExcludeProperty() {
  const result = importDir({ directoryPath: sampleDirectoryPath, importMethod: 'sync', exclude: /sample-file-1|.json/ });

  expect(result).toEqual({
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  });
}

async function doneIfAsyncCallWithExcludeProperty() {
  const result = await importDir({ directoryPath: sampleDirectoryPath, importMethod: 'async', exclude: /sample-file-1|.json/ });

  expect(result).toEqual({
    '/sample-file-2.js':                               require(`${sampleDirectoryPath}/sample-file-2`),
    '/directory-with-some-modules/empty-file.js':      require(`${sampleDirectoryPath}/directory-with-some-modules/empty-file`),
    '/directory-with-some-modules/sample-sub-file.js': require(`${sampleDirectoryPath}/directory-with-some-modules/sample-sub-file`),
  });
}
