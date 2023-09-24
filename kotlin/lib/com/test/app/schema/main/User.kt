package com.test.app.schema.main
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.request.RequestResponse
import com.test.app.schema.post.Post
class User(
  val id: Int,
  val name: String,
  val comments: List<Comment>,
  val posts: List<Post>
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): User? {
      if(deserializer.readInt() != -1307935086) return null
      val id = deserializer.readInt()
      val nameAsByteArray2 = ByteArray(deserializer.readInt())
      deserializer.read(nameAsByteArray2)
      val name = String(nameAsByteArray2, Charsets.UTF_8)
      val lengthComments4 = deserializer.readInt()
      val comments = mutableListOf<Comment>()
      for(indexComments4 in 0..lengthComments4) {
        val itemComments4 = Comment.decode(deserializer) ?: return null
        comments.add(itemComments4)
      }
      val lengthPosts6 = deserializer.readInt()
      val posts = mutableListOf<Post>()
      for(indexPosts6 in 0..lengthPosts6) {
        val itemPosts6 = Post.decode(deserializer) ?: return null
        posts.add(itemPosts6)
      }
      return User(
        id,
        name,
        comments,
        posts
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-1307935086)
    serializer.writeInt(id)
    val baname2 = name.toByteArray(Charsets.UTF_8)
    serializer.writeInt(baname2.size)
    serializer.write(baname2)
    serializer.writeInt(comments.size)
    for(itemComments4 in comments) {
      itemComments4.encode(serializer)
    }
    serializer.writeInt(posts.size)
    for(itemPosts6 in posts) {
      itemPosts6.encode(serializer)
    }
  }
}
