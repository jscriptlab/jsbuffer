package com.test.app.schema.main
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.request.Request
class GetCurrentUser(
  val id: Int
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): GetCurrentUser? {
      if(deserializer.readInt() != -895800374) return null
      val id = deserializer.readInt()
      return GetCurrentUser(
        id
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-895800374)
    serializer.writeInt(id)
  }
}
