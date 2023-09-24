package com.test.app.schema.error
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class ErrorNotFound(
) : Encodable() {
  companion object {
    fun decode(d: Deserializer): ErrorNotFound? {
      if(d.readInt() != -1612310455) return null
      return ErrorNotFound(
      )
    }
  }
  override fun encode(s: Serializer) {
    s.writeInt(-1612310455)
  }
}
