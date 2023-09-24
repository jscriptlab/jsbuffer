package com.test.app.schema.post
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class PostLike(
  val userId: Int
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): PostLike? {
      if(deserializer.readInt() != 266529116) return null
      val userId = deserializer.readInt()
      return PostLike(
        userId
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(266529116)
    serializer.writeInt(userId)
  }
}
