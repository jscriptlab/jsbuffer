package com.test.app.schema.protocol
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.request.Request
class ClientMessageRequest(
  val requestId: Long,
  val payload: Request
) {
  companion object {
    fun decode(d: DataInputStream): ClientMessageRequest? {
      if(d.readInt() != -1480887542) return null
      val requestId = d.readLong()
      val payload = Request.decode(d) ?: return null
      return ClientMessageRequest(
        requestId,
        payload
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(-1480887542)
    s.writeLong(requestId)
    payload.encode(s)
  }
}
