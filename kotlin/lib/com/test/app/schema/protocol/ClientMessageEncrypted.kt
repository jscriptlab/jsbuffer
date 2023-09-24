package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class ClientMessageEncrypted(
  val requestId: Long,
  val payload: ByteArray
) : Encodable() {
  companion object {
    fun decode(d: Deserializer): ClientMessageEncrypted? {
      if(d.readInt() != 1935211896) return null
      val requestId = d.readLong()
      val payload = ByteArray(d.readInt())
      d.read(payload)
      return ClientMessageEncrypted(
        requestId,
        payload
      )
    }
  }
  override fun encode(s: Serializer) {
    s.writeInt(1935211896)
    s.writeLong(requestId)
    s.writeInt(payload.size)
    s.write(payload)
  }
}
