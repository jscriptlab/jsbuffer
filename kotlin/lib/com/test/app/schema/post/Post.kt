package com.test.app.schema.post
import java.io.DataOutput
import java.io.DataInputStream
class Post(
  val id: Long,
  val userId: Int,
  val likes: List<PostLike?>
) {
  companion object {
    fun decode(d: DataInputStream): Post? {
      if(d.readInt() != -1854473321) return null
      val id = d.readLong()
      val userId = d.readInt()
      val lengthLikes4 = d.readInt()
      val likes = mutableListOf<PostLike?>()
      for(indexLikes4 in 0..lengthLikes4) {
        val optionalByteItemLikes45 = d.readByte().toInt()
        var itemLikes4: PostLike?
        if(optionalByteItemLikes45 == 1) {
          val actualValueItemLikes45 = PostLike.decode(d) ?: return null
          itemLikes4 = actualValueItemLikes45
        } else if(optionalByteItemLikes45 == 0) {
          itemLikes4 = null
        } else {
          return null
        }
        likes.add(itemLikes4)
      }
      return Post(
        id,
        userId,
        likes
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(-1854473321)
    s.writeLong(id)
    s.writeInt(userId)
    s.writeInt(likes.size)
    for(itemLikes4 in likes) {
      if(itemLikes4 != null) {
        itemLikes4.encode(s)
      }
    }
  }
}
