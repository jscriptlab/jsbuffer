package com.test.app.schema.post
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.request.Request
class GetPost(
  val id: Int
) {
  companion object {
    fun decode(d: Deserializer): GetPost? {
      if(d.readInt() != -1267528456) return null
      val id = d.readInt()
      return GetPost(
        id
      )
    }
  }
  fun encode(s: Serializer) {
    s.writeInt(-1267528456)
    s.writeInt(id)
  }
}
