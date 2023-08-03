import path from 'path';
import fs from 'fs';

export async function findClosestFileOrFolder(
  startingDir: string,
  expectedName: string
): Promise<string | null> {
  let folders: string[];
  try {
    folders = await fs.promises.readdir(startingDir);
  } catch (reason) {
    return findClosestFileOrFolder(path.dirname(startingDir), expectedName);
  }
  if (folders.includes(expectedName)) {
    return path.resolve(startingDir, expectedName);
  }
  if (path.dirname(startingDir) === startingDir) {
    return null;
  }
  return findClosestFileOrFolder(path.dirname(startingDir), expectedName);
}
