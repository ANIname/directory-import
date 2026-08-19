import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ImportedModulesPrivateOptions,
  ImportedModulesPublicOptions,
  ImportModulesInputArguments,
  ImportModulesMode,
} from './types.d';

/**
 * Convert a file URL to an absolute filesystem path.
 * @param {unknown} value - A potential URL instance passed as a directory path.
 * @returns {string|undefined} The filesystem path, or undefined when value is not a URL.
 * @throws {TypeError} When value is a URL that does not use the file: protocol.
 */
function tryFileUrlToPath(value: unknown): string | undefined {
  if (!(value instanceof URL)) {
    return undefined;
  }

  if (value.protocol !== 'file:') {
    throw new TypeError(`Expected a file URL as directory path, but got: ${value.protocol}`);
  }

  return fileURLToPath(value);
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
      // eslint-disable-next-line security/detect-unsafe-regex
      ?.match(/(?:\/|[A-Za-z]:\\)[/\\]?(?:[^:]+){1,2}/)?.[0] || options.callerFilePath;

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

  // ** If user provided a file URL as first argument,
  // ** treat it as the target directory path (Node fs-style).
  // ** URL is typeof object, so this must run before the options-object branch.
  const filePathFromUrl = tryFileUrlToPath(arguments_[0]);

  if (filePathFromUrl !== undefined) {
    options.targetDirectoryPath = filePathFromUrl;
  }

  // ** If user provided an object as first argument,
  // ** it means that he wants to set custom options
  // ** use it to oweverwrite the default options
  else if (typeof arguments_[0] === 'object') {
    const result = {
      ...getDefaultOptions(),
      ...(arguments_[0] as ImportedModulesPublicOptions),
    };

    const publicTargetDirectoryPath = result.targetDirectoryPath;
    const resolvedTargetDirectoryPath =
      tryFileUrlToPath(publicTargetDirectoryPath) ?? (publicTargetDirectoryPath as string);

    const preparedOptions: ImportedModulesPrivateOptions = {
      ...result,
      targetDirectoryPath: path.resolve(result.callerDirectoryPath, resolvedTargetDirectoryPath),
      callback: typeof arguments_[1] === 'function' ? arguments_[1] : undefined,
    };

    return preparedOptions;
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
