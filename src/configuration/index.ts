import path from 'node:path';
import fs from 'node:fs';

const configuration = {
  async cache() {
    const cacheDirectory = path.resolve(
      __dirname,
      '../../node_modules/.cache/jsbuffer'
    );
    try {
      await fs.promises.access(
        cacheDirectory,
        fs.constants.W_OK | fs.constants.R_OK
      );
    } catch (reason) {
      await fs.promises.mkdir(cacheDirectory, { recursive: true });
    }

    // Make sure it will fail if the directory is not writable even after the initial check
    await fs.promises.access(
      cacheDirectory,
      fs.constants.W_OK | fs.constants.R_OK
    );

    console.log(cacheDirectory);

    return cacheDirectory;
  }
};

export default configuration;
