package com.test.app.schema.error
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class ErrorNotFound(
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): ErrorNotFound? {
      if(deserializer.readInt() != -1612310455) return null
      return ErrorNotFound(
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-1612310455)
  }
}
