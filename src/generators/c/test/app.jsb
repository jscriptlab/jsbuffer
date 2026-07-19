import "./protocol/main.jsb";

export type DeepOptional {
  optional<string> value;
  optional<optional<int>> value2;
}

export type Message {
  Command command;
  optional<Command> command1;
  optional<optional<Command>> command2;
  optional<optional<optional<Command>>> command3;
  optional<optional<optional<optional<Command>>>> command4;
  optional<optional<optional<optional<int>>>> value1;
  optional<optional<optional<optional<int16>>>> value2;
  optional<optional<optional<optional<int8>>>> value3;
  optional<optional<optional<optional<int32>>>> value4;
  optional<optional<optional<optional<uint8>>>> value5;
  optional<optional<optional<optional<uint16>>>> value6;
  optional<optional<optional<optional<uint32>>>> value7;
  optional<optional<optional<optional<string>>>> value8;
  optional<int> value9;
  optional<int16> value10;
  optional<int8> value11;
  optional<int32> value12;
  optional<uint8> value13;
  optional<uint16> value14;
  optional<uint32> value15;
  optional<string> value16;
  optional<optional<optional<optional<DeepOptional>>>> value17;
}

export type CommandMoveForward : Command {
  bool stop;
  double value2;
}

export type CommandMoveBackwards : Command {
  bool stop;
  bytes value;
  float value2;
}

export trait Command {}