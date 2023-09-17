package com.test.app.schema.error
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
class ErrorNotFound(
) {
  companion object {
    fun decode(d: Deserializer): ErrorNotFound? {
      if(d.readInt() != -1612310455) return null
      return ErrorNotFound(
      )
    }
  }
  fun encode(s: Serializer) {
    s.writeInt(-1612310455)
  }
}
