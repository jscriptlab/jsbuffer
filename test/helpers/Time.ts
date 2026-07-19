export default class Time {
  public static readonly milliseconds = class TimeMilliseconds {
    public static readonly Second = 1000;
    public static readonly Minute = 60 * this.Second;
    public static readonly Hour = 60 * this.Minute;
    public static readonly Day = 24 * this.Hour;
  };
}
