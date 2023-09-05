package com.test.app.schema.main
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.request.Request
class GetCurrentUser(
  val id: Int
) {
  companion object {
    fun decode(d: DataInputStream): GetCurrentUser? {
      if(d.readInt() != -895800374) return null
      val id = d.readInt()
      return GetCurrentUser(
        id
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(-895800374)
    s.writeInt(id)
  }
}
