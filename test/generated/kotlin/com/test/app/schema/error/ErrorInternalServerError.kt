package com.test.app.schema.error
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class ErrorInternalServerError(
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): ErrorInternalServerError? {
      if(deserializer.readInt() != 990932201) return null
      return ErrorInternalServerError(
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(990932201)
  }
}
