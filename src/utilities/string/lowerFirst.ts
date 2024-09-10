/**
 * Converts the first character of a string to lowercase.
 * If the string is empty, it returns the original string.
 * If the string has only one character, it converts that character to lowercase.
 * Otherwise, it converts the first character to lowercase and keeps the rest of the string unchanged.
 *
 * @param value - The string to convert.
 * @returns The string with the first character converted to lowercase.
 */
export default function lowerFirst(value: string) {
  const firstCharacter = value[0];
  if (typeof firstCharacter !== 'string') return value;
  if (value.length === 0) return value;
  if (value.length === 1) return value.toLowerCase();
  return `${firstCharacter.toLowerCase()}${value.substring(1)}`;
}
