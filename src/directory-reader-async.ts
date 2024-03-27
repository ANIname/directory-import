import { promises as fs } from 'node:fs';
import path from 'node:path';

import { ImportedModulesPrivateOptions } from './types.d';

/**
 * Async version of the directory reader.
 *
 * I use *for loop* instead of forEach because it is faster.
 * I define the *counter* variable outside the loop because it is faster. Because it is not redefined every iteration.
 * @param {ImportedModulesPrivateOptions} options - The private options generated by the preparePrivateOptions function.
 * @param {string} targetDirectoryPath - The path to the directory to import modules from. Required for recursive calls.
 * @returns {Promise<string[]>} An object containing all imported modules.
 */
export default async function readDirectoryAsync(
  options: ImportedModulesPrivateOptions,
  targetDirectoryPath: string,
): Promise<string[]> {
  const receivedItemsPaths = await fs.readdir(targetDirectoryPath);

  const result = await Promise.all(
    receivedItemsPaths.map(async (itemPath) => {
      const receivedFilesPaths = [];

      const relativeItemPath = path.join(`${targetDirectoryPath}`, `${itemPath}`);

      const stat = await fs.stat(relativeItemPath);

      if (stat.isDirectory() && options.includeSubdirectories) {
        const files = await readDirectoryAsync(options, relativeItemPath);

        receivedFilesPaths.push(...files);
      } else if (stat.isFile()) {
        receivedFilesPaths.push(relativeItemPath);
      }

      return receivedFilesPaths;
    }),
  );

  return result.flat();
}
