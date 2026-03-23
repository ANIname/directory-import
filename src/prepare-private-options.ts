import path from 'node:path';

import {
  ImportedModulesPrivateOptions,
  ImportedModulesPublicOptions,
  ImportModulesInputArguments,
  ImportModulesMode,
} from './types.d';

const CALLER_FILE_PATH_PATTERN = /(?:\/|[A-Za-z]:\\)[/\\]?[^:\n)]+/;

/**
 * Resolve fallback caller file path.
 * @param {string} fallbackCallerDirectoryPath - The directory path used as fallback.
 * @returns {string} A synthetic caller file path within the fallback directory.
 */
function getFallbackCallerFilePath(fallbackCallerDirectoryPath: string): string {
  return path.join(fallbackCallerDirectoryPath, 'directory-import-fallback.js');
}

/**
 * Extract caller file path from an error stack trace.
 * @param {string | undefined} stackTrace - The raw stack trace string.
 * @returns {string | undefined} The detected caller file path or undefined when not found.
 */
function extractCallerFilePathFromStackTrace(stackTrace: string | undefined): string | undefined {
  if (!stackTrace) {
    return undefined;
  }

  const stackTraceLines = stackTrace.split('\n').slice(4);

  for (const stackTraceLine of stackTraceLines) {
    const matchedCallerFilePath = stackTraceLine.match(CALLER_FILE_PATH_PATTERN)?.[0];

    if (matchedCallerFilePath) {
      return matchedCallerFilePath;
    }
  }

  return undefined;
}

const getDefaultOptions = (): ImportedModulesPrivateOptions => {
  const fallbackCallerDirectoryPath = process.cwd();

  const options = {
    includeSubdirectories: true,
    importMode: 'sync' as ImportModulesMode,
    importPattern: /.*/,
    limit: Number.POSITIVE_INFINITY,
    callerFilePath: getFallbackCallerFilePath(fallbackCallerDirectoryPath),
    callerDirectoryPath: fallbackCallerDirectoryPath,
    targetDirectoryPath: fallbackCallerDirectoryPath,
    forceReload: false,
  };

  const extractedCallerFilePath = extractCallerFilePathFromStackTrace(new Error('functional-error').stack);
  if (extractedCallerFilePath) {
    options.callerFilePath = extractedCallerFilePath;
  }

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
