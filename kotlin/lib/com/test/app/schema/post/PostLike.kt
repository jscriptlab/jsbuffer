package com.test.app.schema.post
import java.io.DataOutput
import java.io.DataInputStream
class PostLike(
  val userId: Int
) {
  companion object {
    fun decode(d: DataInputStream): PostLike? {
      if(d.readInt() != 266529116) return null
      val userId = d.readInt()
      return PostLike(
        userId
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(266529116)
    s.writeInt(userId)
  }
}
