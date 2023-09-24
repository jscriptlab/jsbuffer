package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.request.Request
class ServerMessageRequestSuccessResponse(
  val requestId: Long,
  val response: Request
) : Encodable() {
  companion object {
    fun decode(d: Deserializer): ServerMessageRequestSuccessResponse? {
      if(d.readInt() != -539011791) return null
      val requestId = d.readLong()
      val response = Request.decode(d) ?: return null
      return ServerMessageRequestSuccessResponse(
        requestId,
        response
      )
    }
  }
  override fun encode(s: Serializer) {
    s.writeInt(-539011791)
    s.writeLong(requestId)
    response.encode(s)
  }
}
