package com.test.app.schema.post
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.request.Request
class GetPost(
  val id: Int
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): GetPost? {
      if(deserializer.readInt() != -1267528456) return null
      val id = deserializer.readInt()
      return GetPost(
        id
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-1267528456)
    serializer.writeInt(id)
  }
}
