package com.test.app.schema.post
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class PostLike(
  val userId: Int
) : Encodable() {
  companion object {
    fun decode(d: Deserializer): PostLike? {
      if(d.readInt() != 266529116) return null
      val userId = d.readInt()
      return PostLike(
        userId
      )
    }
  }
  override fun encode(s: Serializer) {
    s.writeInt(266529116)
    s.writeInt(userId)
  }
}
