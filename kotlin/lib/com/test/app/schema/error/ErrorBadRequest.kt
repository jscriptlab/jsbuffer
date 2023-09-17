package com.test.app.schema.error
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
class ErrorBadRequest(
) {
  companion object {
    fun decode(d: Deserializer): ErrorBadRequest? {
      if(d.readInt() != 627611118) return null
      return ErrorBadRequest(
      )
    }
  }
  fun encode(s: Serializer) {
    s.writeInt(627611118)
  }
}
