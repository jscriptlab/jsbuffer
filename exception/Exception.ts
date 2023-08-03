export default class Exception {
  public constructor(public readonly what = new Error().stack) {}
  public toString() {
    return this.what;
  }
}
