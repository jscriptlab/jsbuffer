package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.error.Error
class ServerMessageRequestFailureResponse(
  val requestId: Long,
  val response: Error
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): ServerMessageRequestFailureResponse? {
      if(deserializer.readInt() != -1870719710) return null
      val requestId = deserializer.readLong()
      val response = Error.decode(deserializer) ?: return null
      return ServerMessageRequestFailureResponse(
        requestId,
        response
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-1870719710)
    serializer.writeLong(requestId)
    response.encode(serializer)
  }
}
