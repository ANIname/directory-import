import path from 'node:path';

import {
  ImportedModulesPrivateOptions,
  ImportedModulesPublicOptions,
  ImportModulesInputArguments,
  ImportModulesMode,
} from './types.d';

/**
 * Extract a filesystem caller path from a single V8 stack frame line.
 * Anchors on the trailing `:line:column` so directories that contain `:`
 * (for example ISO-timestamp folder names) are not truncated.
 * @param {string | undefined} stackTraceLine - One line from `Error.stack`.
 * @returns {string | undefined} The caller file path when it can be parsed.
 */
export function extractCallerFilePathFromStackLine(stackTraceLine: string | undefined): string | undefined {
  if (!stackTraceLine) {
    return undefined;
  }

  const parenthesizedMatch = /\((.+):(\d+):(\d+)\)/.exec(stackTraceLine);
  const parenthesizedPath = parenthesizedMatch?.[1];

  if (parenthesizedPath && isFilesystemCallerPath(parenthesizedPath)) {
    return parenthesizedPath;
  }

  const bareMatch = /^\s*at (\/.+|[A-Za-z]:[/\\].+):(\d+):(\d+)$/.exec(stackTraceLine);

  if (bareMatch?.[1]) {
    return bareMatch[1];
  }

  return undefined;
}

/**
 * Check whether a parsed stack frame candidate is a filesystem path.
 * @param {string} candidatePath - Path candidate extracted from a stack frame.
 * @returns {boolean} True when the candidate looks like an absolute filesystem path.
 */
function isFilesystemCallerPath(candidatePath: string): boolean {
  return candidatePath.startsWith('/') || /^[A-Za-z]:[/\\]/.test(candidatePath);
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
