package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class ClientMessageEncrypted(
  val requestId: Long,
  val payload: ByteArray
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): ClientMessageEncrypted? {
      if(deserializer.readInt() != 1935211896) return null
      val requestId = deserializer.readLong()
      val payload = ByteArray(deserializer.readInt())
      deserializer.read(payload)
      return ClientMessageEncrypted(
        requestId,
        payload
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(1935211896)
    serializer.writeLong(requestId)
    serializer.writeInt(payload.size)
    serializer.write(payload)
  }
}
