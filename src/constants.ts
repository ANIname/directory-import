import { ImportedModulesPrivateOptions } from './types.d';

export const VALID_IMPORT_EXTENSIONS = ['.js', '.ts', '.json'];

export const DEFAULT_IMPORT_MODULES_PRIVATE_ARGUMENTS: ImportedModulesPrivateOptions = {
  includeSubdirectories: true,
  importMode: 'sync',
  importPattern: /.*/,
  limit: Number.POSITIVE_INFINITY,

  get callerFilePath() {
    return (new Error('functional-error').stack as string).split('\n')[6]?.match(/\(([^)]+)\)/)?.[1] as string;
  },

  get callerDirectoryPath() {
    return this.callerFilePath.split('/').slice(0, -1).join('/');
  },

  get targetDirectoryPath() {
    return this.callerDirectoryPath;
  },
};
