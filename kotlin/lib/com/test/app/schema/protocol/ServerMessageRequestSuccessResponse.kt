package com.test.app.schema.protocol
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.request.Request
class ServerMessageRequestSuccessResponse(
  val requestId: Long,
  val response: Request
) {
  companion object {
    fun decode(d: DataInputStream): ServerMessageRequestSuccessResponse? {
      if(d.readInt() != -539011791) return null
      val requestId = d.readLong()
      val response = Request.decode(d) ?: return null
      return ServerMessageRequestSuccessResponse(
        requestId,
        response
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(-539011791)
    s.writeLong(requestId)
    response.encode(s)
  }
}
