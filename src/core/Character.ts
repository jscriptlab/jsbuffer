export default class Character {
  static isLineBreak(ch: number) {
    return ch === 13 || ch === 10;
  }
  static isIdentifierPart(ch: number) {
    return this.isIdentifierStart(ch) || this.isIntegerPart(ch);
  }
  static isWhiteSpace(ch: number) {
    return ch === 32;
  }
  public static isCarriageReturn(ch: number) {
    return ch === 13;
  }
  public static isVerticalTab(ch: number) {
    return ch === 11;
  }
  public static isFormFeed(ch: number) {
    return ch === 12;
  }
  public static isTab(ch: number) {
    return ch === 9;
  }
  public static isBackspace(ch: number) {
    return ch === 8;
  }
  // "
  static isStringLiteralStart(ch: number) {
    return ch === 34;
  }
  // 0-9
  static isIntegerPart(ch: number) {
    return ch >= 48 && ch <= 57;
  }
  // a-z A-Z _
  static isIdentifierStart(ch: number) {
    return (
      (ch >= 97 && ch <= 122) || // a-z
      (ch >= 65 && ch <= 90) || // A-Z
      ch === 95 // _
    );
  }
}
