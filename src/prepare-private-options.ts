import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ImportedModulesPrivateOptions,
  ImportedModulesPublicOptions,
  ImportModulesInputArguments,
  ImportModulesMode,
} from './types.d';

/**
 * Extract a filesystem caller path from a single stack trace line.
 * Handles both normal paths and ESM `file://` URLs (including percent-encoded characters).
 * @param {string | undefined} stackTraceLine - A single stack frame line from `Error.stack`.
 * @returns {string | undefined} An absolute filesystem path when parsing succeeds.
 */
export function extractCallerFilePathFromStackLine(stackTraceLine: string | undefined): string | undefined {
  if (!stackTraceLine) {
    return undefined;
  }

  const fileUrlMatch = /(file:\/\/.+?):(\d+):(\d+)/.exec(stackTraceLine);
  const fileUrl = fileUrlMatch?.[1];

  if (fileUrl) {
    try {
      return fileURLToPath(fileUrl);
    } catch {
      // Fall through to the filesystem-path parser for malformed URLs.
    }
  }

  // eslint-disable-next-line security/detect-unsafe-regex
  return stackTraceLine.match(/(?:\/|[A-Za-z]:\\)[/\\]?(?:[^:]+){1,2}/)?.[0];
}

const getDefaultOptions = (): ImportedModulesPrivateOptions => {
  const options = {
    includeSubdirectories: true,
    importMode: 'sync' as ImportModulesMode,
    importPattern: /.*/,
    limit: Number.POSITIVE_INFINITY,
    callerFilePath: path.resolve('/'),
    callerDirectoryPath: path.resolve('/'),
    targetDirectoryPath: path.resolve('/'),
    forceReload: false,
  };

  options.callerFilePath =
    extractCallerFilePathFromStackLine((new Error('functional-error').stack as string).split('\n')[4]) ||
    options.callerFilePath;

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
