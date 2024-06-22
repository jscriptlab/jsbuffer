export function upperFirst(value: string) {
  return `${value[0]?.toUpperCase()}${value.substring(1)}`;
}

export function lowerFirst(value: string) {
  return `${value[0]?.toLowerCase()}${value.substring(1)}`;
}

export function camelCase(value: string) {
  return value.replace(/[-_](.)/g, (_, group) => group.toUpperCase());
}

export function dashCase(value: string) {
  return (
    value
      .normalize('NFD')
      // Insert dashes before any uppercase letters that follow a lowercase letter or a number
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // Convert spaces, underscores, and multiple dashes to a single dash
      .replace(/[\s_]+|[-]+/g, '-')
      // Convert to lowercase
      .toLowerCase()
      // Remove any non-alphanumeric characters except for dashes
      .replace(/[^a-z0-9-]/gi, '')
      // Ensure it doesn't start or end with a dash
      .replace(/^-|-$/g, '')
  );
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
