export function upperFirst(value: string) {
  return transformStringProperty(value, 0, (value) => value.toUpperCase());
}

export function transformStringProperty(
  value: string,
  index: number,
  transform: (value: string) => string
) {
  return value
    .split('')
    .map((letter, i2) => (i2 === index ? transform(letter) : letter))
    .join('');
}

export function lowerFirst(value: string) {
  return transformStringProperty(value, 0, (value) => value.toLowerCase());
}

export function enforceLocalImport(value: string) {
  if (!value.startsWith('.')) {
    return `./${value}`;
  }
  return value;
}

export function replaceExtension(
  k: string,
  replacement: string,
  extension = '[a-zA-Z_-]'
) {
  return k.replace(
    new RegExp(`([a-zA-Z0-9_-]+)${extension}$`),
    `$1${replacement}`
  );
}

export function getMetadataFileName(k: string) {
  return replaceExtension(k, '.metadata.json', '.(ts|js)');
}
