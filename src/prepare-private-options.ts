import path from 'node:path';

import {
  ImportedModulesPrivateOptions,
  ImportedModulesPublicOptions,
  ImportModulesInputArguments,
  ImportModulesMode,
} from './types.d';

const LIBRARY_STACK_FRAME_NAMES = new Set(['getDefaultOptions', 'preparePrivateOptions', 'directoryImport']);

/**
 * Check whether a stack frame belongs to this library.
 * @param {string} stackLine - One line from an Error stack trace.
 * @returns {boolean} Whether the frame is part of the library implementation.
 */
function isLibraryStackFrame(stackLine: string): boolean {
  const stackFrameName = stackLine.match(/^\s*at\s+([^\s(]+)/)?.[1];

  return stackFrameName ? LIBRARY_STACK_FRAME_NAMES.has(stackFrameName) : false;
}

/**
 * Extract a usable absolute file path from a stack trace line.
 * @param {string} stackLine - One line from an Error stack trace.
 * @returns {string | undefined} The absolute file path, if the line points to a user file.
 */
function extractCallerFilePathFromStackLine(stackLine: string): string | undefined {
  const stackLocation = stackLine.match(/\((.*):\d+:\d+\)$/)?.[1] || stackLine.match(/at (.*):\d+:\d+$/)?.[1];

  if (!stackLocation || !path.isAbsolute(stackLocation) || isLibraryStackFrame(stackLine)) {
    return undefined;
  }

  return stackLocation;
}

/**
 * Resolve the file path that called directoryImport.
 * @param {string | undefined} stack - The stack trace captured while preparing options.
 * @returns {string | undefined} The caller file path when it can be identified safely.
 */
function getCallerFilePath(stack: string | undefined): string | undefined {
  return stack
    ?.split('\n')
    .map((stackLine) => extractCallerFilePathFromStackLine(stackLine))
    .find(Boolean);
}

const getDefaultOptions = (): ImportedModulesPrivateOptions => {
  const fallbackCallerDirectoryPath = process.cwd();
  const callerFilePath = getCallerFilePath(new Error('functional-error').stack);
  const callerDirectoryPath = callerFilePath ? path.dirname(callerFilePath) : fallbackCallerDirectoryPath;

  return {
    includeSubdirectories: true,
    importMode: 'sync' as ImportModulesMode,
    importPattern: /.*/,
    limit: Number.POSITIVE_INFINITY,
    callerFilePath: callerFilePath || fallbackCallerDirectoryPath,
    callerDirectoryPath,
    targetDirectoryPath: callerDirectoryPath,
    forceReload: false,
  };
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
