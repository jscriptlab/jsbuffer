package com.test.app.schema.protocol
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.request.Request
class ClientMessageRequest(
  val requestId: Long,
  val payload: Request
) {
  companion object {
    fun decode(d: Deserializer): ClientMessageRequest? {
      if(d.readInt() != -1480887542) return null
      val requestId = d.readLong()
      val payload = Request.decode(d) ?: return null
      return ClientMessageRequest(
        requestId,
        payload
      )
    }
  }
  fun encode(s: Serializer) {
    s.writeInt(-1480887542)
    s.writeLong(requestId)
    payload.encode(s)
  }
}
