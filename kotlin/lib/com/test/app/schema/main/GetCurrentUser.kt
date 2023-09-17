package com.test.app.schema.main
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.request.Request
class GetCurrentUser(
  val id: Int
) {
  companion object {
    fun decode(d: Deserializer): GetCurrentUser? {
      if(d.readInt() != -895800374) return null
      val id = d.readInt()
      return GetCurrentUser(
        id
      )
    }
  }
  fun encode(s: Serializer) {
    s.writeInt(-895800374)
    s.writeInt(id)
  }
}
