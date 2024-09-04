export trait Request {}
export trait Response {}

export type Void : Response {
  // C99 does not allow empty structs
  int value;
}

export type User : Response {
  int id;
  string name;
}

export call GetUser : Request => User {
  int id;
}
