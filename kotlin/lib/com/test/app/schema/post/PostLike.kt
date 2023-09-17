package com.test.app.schema.post
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
class PostLike(
  val userId: Int
) {
  companion object {
    fun decode(d: Deserializer): PostLike? {
      if(d.readInt() != 266529116) return null
      val userId = d.readInt()
      return PostLike(
        userId
      )
    }
  }
  fun encode(s: Serializer) {
    s.writeInt(266529116)
    s.writeInt(userId)
  }
}
