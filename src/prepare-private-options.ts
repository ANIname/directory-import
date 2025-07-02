import path from 'node:path';

import {
  ImportedModulesPrivateOptions,
  ImportedModulesPublicOptions,
  ImportModulesInputArguments,
  ImportModulesMode,
} from './types.d';

/**
 * Validates a path to prevent dangerous directory traversal attacks
 * @param {string} inputPath - The path to validate
 * @param {string} basePath - The base path for resolution
 * @returns {string} The validated resolved path
 * @throws {Error} If dangerous path traversal is detected
 */
function validatePath(inputPath: string, basePath: string): string {
  // Check for dangerous patterns that could access sensitive system files
  const dangerousPatterns = [
    /\.\.[\/\\]\.\.[\/\\]\.\.[\/\\]/, // Three or more levels up
    /[\/\\]etc[\/\\]/, // Unix system config directory
    /[\/\\]proc[\/\\]/, // Unix process directory  
    /[\/\\]sys[\/\\]/, // Unix system directory
    /[\/\\]root[\/\\]/, // Unix root directory
    /[\/\\]boot[\/\\]/, // Unix boot directory
    /C:[\/\\]Windows[\/\\]/i, // Windows system directory
    /C:[\/\\]Users[\/\\][^\/\\]+[\/\\]AppData[\/\\]/i, // Windows user data
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(inputPath)) {
      throw new Error(`Dangerous path pattern detected: "${inputPath}"`);
    }
  }
  
  return path.resolve(basePath, inputPath);
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
    (new Error('functional-error').stack as string)
      .split('\n')[4]
      // Safe regex pattern to avoid ReDoS attacks
      ?.match(/(?:\/|[A-Za-z]:\\)[/\\]?[^:]+/)?.[0] || options.callerFilePath;

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

    result.targetDirectoryPath = validatePath(result.targetDirectoryPath, result.callerDirectoryPath);
    result.callback = typeof arguments_[1] === 'function' ? arguments_[1] : undefined;

    return result;
  }

  // ** If user provided a string
  // ** it means that he wants to set the target directory path as first argument
  // ** use it to oweverwrite the default options
  else if (typeof arguments_[0] === 'string') {
    options.targetDirectoryPath = validatePath(arguments_[0], options.callerDirectoryPath);
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
