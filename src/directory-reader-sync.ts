import fs from 'node:fs';

import { ImportedModulesPrivateOptions } from './types.d';

/**
 * Sync version of the directory reader.
 *
 * !important this function will block the event loop until it finishes.
 * I use *for loop* instead of forEach because it is faster.
 * I define the *counter* variable outside the loop because it is faster. Because it is not redefined every iteration.
 * @param {ImportedModulesPrivateOptions} options - The private options generated by the preparePrivateOptions function.
 * @param {string} targetDirectoryPath - The path to the directory to import modules from. Required for recursive calls.
 * @returns {string[]} An array of file paths.
 */
export default function readDirectorySync(
  options: ImportedModulesPrivateOptions,
  targetDirectoryPath: string,
): string[] {
  const receivedItemsPaths = fs.readdirSync(targetDirectoryPath);
  const receivedDirectoriesPaths = [];
  const receivedFilesPaths = [];

  // Get the files and directories paths from the target directory.
  let itemsCounter = 0;
  for (itemsCounter; itemsCounter < receivedItemsPaths.length; itemsCounter += 1) {
    const itemPath = `${targetDirectoryPath}/${receivedItemsPaths[itemsCounter]}`;
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory() && options.includeSubdirectories) {
      receivedDirectoriesPaths.push(itemPath);
    } else if (stat.isFile()) {
      receivedFilesPaths.push(itemPath);
    }
  }

  // Recursively get the files paths from the subdirectories.
  let directoriesCounter = 0;
  for (directoriesCounter; directoriesCounter < receivedDirectoriesPaths.length; directoriesCounter += 1) {
    const files = readDirectorySync(options, receivedDirectoriesPaths[directoriesCounter] as string);

    receivedFilesPaths.push(...files);
  }

  // Return the files paths.
  return receivedFilesPaths;
}
