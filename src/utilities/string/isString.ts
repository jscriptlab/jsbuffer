/**
 * Checks if the given value is a string.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} if the value is a string, false otherwise.
 */
export default function isString(value: unknown): value is string {
  return typeof value === 'string';
}
