import fs from 'node:fs';
import path from 'node:path';

import {
  ImportedModulesPrivateOptions,
  ImportedModulesPublicOptions,
  ImportModulesInputArguments,
  ImportModulesMode,
} from './types.d';

/**
 * Extract an absolute file path from a V8 stack trace line.
 * @param {string} stackLine - The stack trace line to inspect.
 * @returns {string | undefined} The absolute file path when the line contains one.
 */
function getFilePathFromStackLine(stackLine: string): string | undefined {
  return stackLine.match(/\(?((?:\/|[A-Za-z]:\\)[^():]+):\d+:\d+\)?$/)?.[1];
}

/**
 * Check whether a file path belongs to a directory.
 * @param {string} filePath - The absolute file path to check.
 * @param {string} directoryPath - The absolute directory path to compare against.
 * @returns {boolean} Whether the file path is inside the directory.
 */
function isFilePathInsideDirectory(filePath: string, directoryPath: string): boolean {
  const relativeFilePath = path.relative(directoryPath, filePath);

  return relativeFilePath !== '' && !relativeFilePath.startsWith('..') && !path.isAbsolute(relativeFilePath);
}

/**
 * Check whether a path points to an existing regular file.
 * @param {string} filePath - The absolute file path to check.
 * @returns {boolean} Whether the path exists and is a regular file.
 */
function isExistingFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Resolve the caller file path from the current stack trace.
 * @param {string | undefined} stack - The stack trace to inspect.
 * @returns {string | undefined} The first existing caller file outside this package.
 */
function getCallerFilePathFromStack(stack: string | undefined): string | undefined {
  if (!stack) return undefined;

  for (const stackLine of stack.split('\n')) {
    const filePath = getFilePathFromStackLine(stackLine);

    if (!filePath) continue;
    if (isFilePathInsideDirectory(filePath, __dirname)) continue;
    if (!isExistingFile(filePath)) continue;

    return filePath;
  }

  return undefined;
}

const getDefaultOptions = (): ImportedModulesPrivateOptions => {
  const fallbackCallerFilePath = path.join(process.cwd(), '__directory-import-caller__.js');
  const options = {
    includeSubdirectories: true,
    importMode: 'sync' as ImportModulesMode,
    importPattern: /.*/,
    limit: Number.POSITIVE_INFINITY,
    callerFilePath: fallbackCallerFilePath,
    callerDirectoryPath: process.cwd(),
    targetDirectoryPath: process.cwd(),
    forceReload: false,
  };

  options.callerFilePath = getCallerFilePathFromStack(new Error('functional-error').stack) || options.callerFilePath;

  options.callerDirectoryPath = path.dirname(options.callerFilePath);
  options.targetDirectoryPath = options.callerDirectoryPath;
  return options;
};

/**
 * Prepare the options object from the provided arguments.
 * @param {...any} arguments_ - The arguments.
 * @returns {ImportedModulesPrivateOptions} The options object.
 */
export default function preparePrivateOptions(
  ...arguments_: ImportModulesInputArguments
): ImportedModulesPrivateOptions {
  const options = { ...getDefaultOptions() };

  // * Check first argument

  // ** If user provided nothing as first argument,
  // ** it means that he wants to use the default options
  // ** return the default options
  if (arguments_[0] === undefined) {
    return options;
  }

  // ** If user provided an object as first argument,
  // ** it means that he wants to set custom options
  // ** use it to oweverwrite the default options
  else if (typeof arguments_[0] === 'object') {
    const result = {
      ...getDefaultOptions(),
      ...(arguments_[0] as ImportedModulesPublicOptions),
    };

    result.targetDirectoryPath = path.resolve(result.callerDirectoryPath, result.targetDirectoryPath);
    result.callback = typeof arguments_[1] === 'function' ? arguments_[1] : undefined;

    return result;
  }

  // ** If user provided a string
  // ** it means that he wants to set the target directory path as first argument
  // ** use it to oweverwrite the default options
  else if (typeof arguments_[0] === 'string') {
    options.targetDirectoryPath = path.resolve(options.callerDirectoryPath, arguments_[0]);
  }

  // ** If user provided a function
  // ** it means that he wants to set the callback as first argument
  // ** use it to oweverwrite the default options
  else if (typeof arguments_[0] === 'function') {
    options.callback = arguments_[0];
  }

  // ** If user provided something else
  // ** it means that he made a mistake
  // ** throw an error
  else {
    throw new TypeError(
      `Expected undefined, object, string or function as first argument, but got: ${typeof arguments_[0]}`,
    );
  }

  // * Check second argument

  // ** If user provided string as second argument
  // ** it means that he wants to set the import mode (sync or async) as second argument
  // ** use it to oweverwrite the default options
  if (typeof arguments_[1] === 'string') {
    // ** But if the import mode is not sync or async
    // ** throw an error
    if (arguments_[1] !== 'sync' && arguments_[1] !== 'async') {
      throw new TypeError(`Expected sync or async as second argument, but got: ${arguments_[1]}`);
    }

    options.importMode = arguments_[1];
  }

  // ** If user provided a function as second argument
  // ** it means that he wants to set the callback as second argument
  // ** use it to oweverwrite the default options
  else if (typeof arguments_[1] === 'function') {
    options.callback = arguments_[1];
  }

  // * Check third argument

  // ** If user provided a function as third argument
  // ** it means that he wants to set the callback as third argument
  // ** use it to oweverwrite the default options
  if (typeof arguments_[2] === 'function') {
    options.callback = arguments_[2];
  }

  // * Return the options object
  return options;
}
