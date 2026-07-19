package com.test.app.schema.post
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class Post(
  val id: Long,
  val userId: Int,
  val likes: List<PostLike?>
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): Post? {
      if(deserializer.readInt() != -1854473321) return null
      val id = deserializer.readLong()
      val userId = deserializer.readInt()
      val lengthLikes4 = deserializer.readInt()
      val likes = (0 until lengthLikes4).map {
        val optionalByteItemLikes45 = deserializer.readByte().toInt()
        var itemLikes4: PostLike?
        if(optionalByteItemLikes45 == 1) {
          val actualValueItemLikes45 = PostLike.decode(deserializer) ?: return null
          itemLikes4 = actualValueItemLikes45
        } else if(optionalByteItemLikes45 == 0) {
          itemLikes4 = null
        } else {
          return null
        }
        itemLikes4
      }
      return Post(
        id,
        userId,
        likes
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-1854473321)
    serializer.writeLong(id)
    serializer.writeInt(userId)
    serializer.writeInt(likes.size)
    for(itemLikes4 in likes) {
      if(itemLikes4 != null) {
        itemLikes4.encode(serializer)
      }
    }
  }
}
