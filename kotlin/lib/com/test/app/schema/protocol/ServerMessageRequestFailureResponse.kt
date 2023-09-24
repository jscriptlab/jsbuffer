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
    fun decode(d: Deserializer): ServerMessageRequestFailureResponse? {
      if(d.readInt() != -1870719710) return null
      val requestId = d.readLong()
      val response = Error.decode(d) ?: return null
      return ServerMessageRequestFailureResponse(
        requestId,
        response
      )
    }
  }
  override fun encode(s: Serializer) {
    s.writeInt(-1870719710)
    s.writeLong(requestId)
    response.encode(s)
  }
}
