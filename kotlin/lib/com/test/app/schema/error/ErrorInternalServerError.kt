package com.test.app.schema.error
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
class ErrorInternalServerError(
) {
  companion object {
    fun decode(d: Deserializer): ErrorInternalServerError? {
      if(d.readInt() != 990932201) return null
      return ErrorInternalServerError(
      )
    }
  }
  fun encode(s: Serializer) {
    s.writeInt(990932201)
  }
}
