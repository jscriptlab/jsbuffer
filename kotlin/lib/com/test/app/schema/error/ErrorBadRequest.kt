package com.test.app.schema.error
import java.io.DataOutput
import java.io.DataInputStream
class ErrorBadRequest(
) {
  companion object {
    fun decode(d: DataInputStream): ErrorBadRequest? {
      if(d.readInt() != 627611118) return null
      return ErrorBadRequest(
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(627611118)
  }
}
