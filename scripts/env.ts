export default function env(key: string) {
  const value = process.env[key];
  if (typeof value !== 'string') {
    throw new Error(`Missing ${key} environment variable.`);
  }
  return value;
}
