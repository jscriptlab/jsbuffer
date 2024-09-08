import "./protocol/main.jsb";

export type Message {
  Command command;
  optional<Command> command1;
  optional<optional<Command>> command2;
  optional<optional<optional<Command>>> command3;
  optional<optional<optional<optional<Command>>>> command4;
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