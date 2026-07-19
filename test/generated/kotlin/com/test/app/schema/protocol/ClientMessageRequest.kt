package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.request.Request
class ClientMessageRequest(
  val requestId: Long,
  val payload: Request
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): ClientMessageRequest? {
      if(deserializer.readInt() != -1480887542) return null
      val requestId = deserializer.readLong()
      val payload = Request.decode(deserializer) ?: return null
      return ClientMessageRequest(
        requestId,
        payload
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-1480887542)
    serializer.writeLong(requestId)
    payload.encode(serializer)
  }
}
