import "./protocol/main.jsb";

export type Message {
  Command command;
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