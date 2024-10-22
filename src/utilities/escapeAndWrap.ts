import isEmptyString from './string/isEmptyString';
import isString from './string/isString';

export default function escapeAndWrap(value: string, escape: string): string {
  const head = escape[0];
  if (!isString(head) || isEmptyString(head)) {
    throw new Error(`Tried to escape and wrap with an empty quote: ${value}`);
  }
  let tail = escape[1];
  if (!isString(tail)) {
    tail = head;
  }
  let newValue = value;
  for (const edge of [head, tail]) {
    const escapedEdge = edge.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    newValue = value.replace(new RegExp(escapedEdge, 'g'), `\\${edge}`);
  }
  return `${head}${newValue}${tail}`;
}
