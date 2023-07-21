import path from 'path';
import fs from 'fs';

export async function fileClosestFileOrFolder(
  startingDir: string,
  expectedName: string
): Promise<string | null> {
  let folders: string[];
  try {
    folders = await fs.promises.readdir(startingDir);
  } catch (reason) {
    return fileClosestFileOrFolder(path.dirname(startingDir), expectedName);
  }
  if (folders.includes(expectedName)) {
    return path.resolve(startingDir, expectedName);
  }
  if (path.dirname(startingDir) === startingDir) {
    return null;
  }
  return fileClosestFileOrFolder(path.dirname(startingDir), expectedName);
}
