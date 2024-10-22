import isString from './isString';

/**
 * Check if `value` is an empty string
 * @param value Unknown value to check if it's an empty string
 * @returns Returns `true` if `value` is an empty string
 */
export default function isEmptyString(value: unknown): value is '' {
  return isString(value) && value.length === 0;
}
