export function upperFirst(value: string) {
  return `${value[0]?.toUpperCase()}${value.substring(1)}`;
}

export function lowerFirst(value: string) {
  return `${value[0]?.toLowerCase()}${value.substring(1)}`;
}
