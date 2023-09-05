package com.test.app.schema.protocol
import java.io.DataOutput
import java.io.DataInputStream
class ClientMessageEncrypted(
  val requestId: Long,
  val payload: ByteArray
) {
  companion object {
    fun decode(d: DataInputStream): ClientMessageEncrypted? {
      if(d.readInt() != 1935211896) return null
      val requestId = d.readLong()
      val payload = ByteArray(d.readInt())
      d.readFully(payload)
      return ClientMessageEncrypted(
        requestId,
        payload
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(1935211896)
    s.writeLong(requestId)
    s.writeInt(payload.size)
    s.write(payload)
  }
}
