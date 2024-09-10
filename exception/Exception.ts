export default class Exception {
  public constructor(public readonly what: string = '') {}
  public toString() {
    return this.what;
  }
}
