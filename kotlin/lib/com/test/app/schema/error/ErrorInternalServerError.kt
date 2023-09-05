package com.test.app.schema.error
import java.io.DataOutput
import java.io.DataInputStream
class ErrorInternalServerError(
) {
  companion object {
    fun decode(d: DataInputStream): ErrorInternalServerError? {
      if(d.readInt() != 990932201) return null
      return ErrorInternalServerError(
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(990932201)
  }
}
