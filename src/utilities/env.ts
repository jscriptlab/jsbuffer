function optional(key: string) {
  const value = process.env[key];
  if (typeof value !== 'string') {
    return null;
  }
  return value;
}

interface IEnvironmentVariables {
  /**
   * Get the value of an environment variable.
   * @param key The name of the environment variable
   * @throws If the environment variable is missing
   * @returns The value of the environment variable
   */
  (key: string): string;
  /**
   * Get the value of an environment variable and does not throw if it is missing.
   * @param key The name of the environment variable
   */
  optional(key: string): string | null;
}

const env: IEnvironmentVariables = (key: string) => {
  const value = optional(key);
  if (value === null) {
    throw new Error(`Missing ${key} environment variable.`);
  }
  return value;
};

env.optional = optional;

export default env;
