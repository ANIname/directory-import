import path from 'node:path';

import {
  ImportedModulesPrivateOptions,
  ImportedModulesPublicOptions,
  ImportModulesInputArguments,
  ImportModulesMode,
} from './types.d';

const DEFAULT_CALLER_FILE_NAME = 'index.js';
const CALLER_STACK_LINE_INDEX = 5;

/**
 * Check whether a path is absolute on POSIX or Windows.
 * @param {string} filePath - The file path to check.
 * @returns {boolean} Whether the file path is absolute.
 */
function isAbsoluteFilePath(filePath: string): boolean {
  return path.isAbsolute(filePath) || path.win32.isAbsolute(filePath);
}

/**
 * Remove trailing line and column numbers from a stack trace location.
 * @param {string} stackLocation - The stack trace location to normalize.
 * @returns {string} The stack trace location without line and column suffixes.
 */
function removeLineAndColumnFromStackLocation(stackLocation: string): string {
  const stackLocationParts = stackLocation.split(':');
  const lastStackLocationPart = stackLocationParts[stackLocationParts.length - 1];
  const secondLastStackLocationPart = stackLocationParts[stackLocationParts.length - 2];

  if (stackLocationParts.length >= 3 && Number.isInteger(Number(lastStackLocationPart))) {
    stackLocationParts.pop();
  }

  if (stackLocationParts.length >= 2 && Number.isInteger(Number(secondLastStackLocationPart))) {
    stackLocationParts.pop();
  }

  return stackLocationParts.join(':');
}

/**
 * Extract an absolute file path from one stack trace line.
 * @param {string} stackLine - The stack trace line to parse.
 * @returns {string | undefined} The absolute file path when the line contains one.
 */
function getFilePathFromStackLine(stackLine: string): string | undefined {
  const trimmedStackLine = stackLine.trim();
  const stackLocationStartIndex = trimmedStackLine.lastIndexOf('(');
  const stackLocationEndIndex = trimmedStackLine.lastIndexOf(')');
  const stackLocation =
    stackLocationStartIndex >= 0 && stackLocationEndIndex > stackLocationStartIndex
      ? trimmedStackLine.slice(stackLocationStartIndex + 1, stackLocationEndIndex)
      : trimmedStackLine.replace(/^at\s+/, '').trim();
  const filePath = removeLineAndColumnFromStackLocation(stackLocation);

  return isAbsoluteFilePath(filePath) ? filePath : undefined;
}

/**
 * Resolve the caller file path from the runtime stack or a safe process fallback.
 * @returns {string} The detected caller file path, or a path inside the current working directory.
 */
function getCallerFilePath(): string {
  const fallbackCallerFilePath = path.join(process.cwd(), DEFAULT_CALLER_FILE_NAME);
  const stackLines = new Error('functional-error').stack?.split('\n') ?? [];
  const stackCallerFilePath = stackLines[CALLER_STACK_LINE_INDEX]
    ? getFilePathFromStackLine(stackLines[CALLER_STACK_LINE_INDEX])
    : undefined;

  return stackCallerFilePath || fallbackCallerFilePath;
}

const getDefaultOptions = (): ImportedModulesPrivateOptions => {
  const callerFilePath = getCallerFilePath();
  const callerDirectoryPath = path.dirname(callerFilePath);
  const options = {
    includeSubdirectories: true,
    importMode: 'sync' as ImportModulesMode,
    importPattern: /.*/,
    limit: Number.POSITIVE_INFINITY,
    callerFilePath,
    callerDirectoryPath,
    targetDirectoryPath: callerDirectoryPath,
    forceReload: false,
  };

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
