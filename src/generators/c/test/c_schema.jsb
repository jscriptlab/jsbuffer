export type Message {
  Command command;
}

export type Command {
  uint32 id;
  bool is_valid;
}
