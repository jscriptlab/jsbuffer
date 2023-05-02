export default class Exception {
  public constructor(public readonly what = '') {}
  public toString() {
    return this.what;
  }
}
