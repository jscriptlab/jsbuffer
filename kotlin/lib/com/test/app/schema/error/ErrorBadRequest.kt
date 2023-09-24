package com.test.app.schema.error
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class ErrorBadRequest(
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): ErrorBadRequest? {
      if(deserializer.readInt() != 627611118) return null
      return ErrorBadRequest(
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(627611118)
  }
}
