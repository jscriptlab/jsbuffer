import JSBI from "jsbi";
import { ISerializer } from "./__types__";
import { IDeserializer } from "./__types__";
export interface JSBExtensionTest  {
  _name: 'jsb-extension.JSBExtensionTest';
  a: number;
}
export function isJSBExtensionTest(value: unknown): value is JSBExtensionTest {
  if(!(typeof value === 'object' && value !== null && '_name' in value && typeof value['_name'] === 'string' && value['_name'] === "jsb-extension.JSBExtensionTest")) return false;
  if(!(
    "a" in value && ((__v0) => (typeof __v0 === 'number' && JSBI.equal(JSBI.BigInt(__v0),JSBI.BigInt(__v0)) && JSBI.greaterThanOrEqual(JSBI.BigInt(__v0),JSBI.BigInt("-2147483648")) && JSBI.lessThanOrEqual(JSBI.BigInt(__v0),JSBI.BigInt("2147483647"))))(value['a'])
  )) return false;
  return true;
}
export interface JSBExtensionTestInputParams {
  a: number;
}
export function JSBExtensionTest(params: JSBExtensionTestInputParams): JSBExtensionTest {
  return {
    _name: 'jsb-extension.JSBExtensionTest',
    a: params['a']
  };
}
export function encodeJSBExtensionTest(__s: ISerializer, value: JSBExtensionTest) {
  __s.writeInt32(744014990);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeInt32(__pv0);
}
export function decodeJSBExtensionTest(__d: IDeserializer): JSBExtensionTest | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 744014990) return null;
  let a: number;
  /**
   * decoding param: a
   */
  a = __d.readInt32();
  return {
    _name: 'jsb-extension.JSBExtensionTest',
    a
  };
}
export function defaultJSBExtensionTest(params: Partial<JSBExtensionTestInputParams> = {}): JSBExtensionTest {
  return JSBExtensionTest({
    a: 0,
    ...params
  });
}
export function compareJSBExtensionTest(__a: JSBExtensionTest, __b: JSBExtensionTest): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'] === __b['a']
  );
}
export function updateJSBExtensionTest(value: JSBExtensionTest, changes: Partial<JSBExtensionTestInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(changes['a'] === value['a'])) {
      value = JSBExtensionTest({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
