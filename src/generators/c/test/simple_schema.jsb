export type User {
  int id;
  optional<Post> last_post;
}

export trait Post {}

export type PostActive : Post {
  int id;
  // The author of the post
  int authorId;
  string title;
}

export type PostDeleted : Post {
  int id;
  // The author of the post
  int authorId;
  string title;
}
