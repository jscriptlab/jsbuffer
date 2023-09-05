package com.test.app.schema.error
import java.io.DataOutput
import java.io.DataInputStream
class ErrorNotFound(
) {
  companion object {
    fun decode(d: DataInputStream): ErrorNotFound? {
      if(d.readInt() != -1612310455) return null
      return ErrorNotFound(
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(-1612310455)
  }
}
