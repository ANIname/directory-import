import path from 'node:path';

export const DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY = '../sample-directory';

export const DEFAULT_ABSOLUTE_PATH_TO_SAMPLE_DIRECTORY = path.resolve(
  // eslint-disable-next-line unicorn/prefer-module
  __dirname,
  DEFAULT_RELATIVE_PATH_TO_SAMPLE_DIRECTORY,
);

export const DEFAULT_EXPECTED_RESULT_FROM_SAMPLE_DIRECTORY = {
  '/sample-file-1.ts': { default: 'This is first sampleFile' },
  '/sample-file-2.js': { testData: 'Hello World!' },
  '/sample-file-3.json': { serverHost: '0.0.0.0', serverPort: 3000 },
  '/directory-with-some-modules/empty-file.js': {},
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  '/directory-with-some-modules/sample-sub-file.js': expect.any(Function),
};

export const DEFAULT_EXPECTED_CALLBACK_RESULTS_FROM_SAMPLE_DIRECTORY = [
  {
    index: 0,
    moduleName: 'sample-file-1',
    modulePath: '/sample-file-1.ts',
    moduleContent: { default: 'This is first sampleFile' },
  },
  {
    index: 1,
    moduleName: 'sample-file-2',
    modulePath: '/sample-file-2.js',
    moduleContent: { testData: 'Hello World!' },
  },
  {
    index: 2,
    moduleName: 'sample-file-3',
    modulePath: '/sample-file-3.json',
    moduleContent: { serverHost: '0.0.0.0', serverPort: 3000 },
  },
  {
    index: 3,
    moduleName: 'empty-file',
    modulePath: '/directory-with-some-modules/empty-file.js',
    moduleContent: {},
  },
  {
    index: 4,
    moduleName: 'sample-sub-file',
    modulePath: '/directory-with-some-modules/sample-sub-file.js',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    moduleContent: expect.any(Function),
  },
];
