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
    fun decode(deserializer: Deserializer): ServerMessageRequestSuccessResponse? {
      if(deserializer.readInt() != -539011791) return null
      val requestId = deserializer.readLong()
      val response = Request.decode(deserializer) ?: return null
      return ServerMessageRequestSuccessResponse(
        requestId,
        response
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-539011791)
    serializer.writeLong(requestId)
    response.encode(serializer)
  }
}
