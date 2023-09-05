package com.test.app.schema.main
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.request.RequestResponse
import com.test.app.schema.post.Post
class User(
  val id: Int,
  val name: String,
  val comments: List<Comment>,
  val posts: List<Post>
) {
  companion object {
    fun decode(d: DataInputStream): User? {
      if(d.readInt() != -1307935086) return null
      val id = d.readInt()
      val nameAsByteArray2 = ByteArray(d.readInt())
      d.readFully(nameAsByteArray2)
      val name = String(nameAsByteArray2, Charsets.UTF_8)
      val lengthComments4 = d.readInt()
      val comments = mutableListOf<Comment>()
      for(indexComments4 in 0..lengthComments4) {
        val itemComments4 = Comment.decode(d) ?: return null
        comments.add(itemComments4)
      }
      val lengthPosts6 = d.readInt()
      val posts = mutableListOf<Post>()
      for(indexPosts6 in 0..lengthPosts6) {
        val itemPosts6 = Post.decode(d) ?: return null
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
  fun encode(s: DataOutput) {
    s.writeInt(-1307935086)
    s.writeInt(id)
    val baname2 = name.toByteArray(Charsets.UTF_8)
    s.writeInt(baname2.size)
    s.write(baname2)
    s.writeInt(comments.size)
    for(itemComments4 in comments) {
      itemComments4.encode(s)
    }
    s.writeInt(posts.size)
    for(itemPosts6 in posts) {
      itemPosts6.encode(s)
    }
  }
}
