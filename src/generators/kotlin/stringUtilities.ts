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
