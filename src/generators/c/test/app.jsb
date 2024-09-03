export type Message {
  Command command;
}

export type CommandMoveForward : Command {
  bool stop;
}

export type CommandMoveBackwards : Command {
  bool stop;
}

export trait Command {}