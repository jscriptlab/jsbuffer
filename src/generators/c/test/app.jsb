import "./protocol/main.jsb";

export type Message {
  Command command;
}

export type CommandMoveForward : Command {
  bool stop;
}

export type CommandMoveBackwards : Command {
  bool stop;
  bytes value;
}

export trait Command {}