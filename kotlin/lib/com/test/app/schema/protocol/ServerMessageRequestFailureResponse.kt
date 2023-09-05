package com.test.app.schema.protocol
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.error.Error
class ServerMessageRequestFailureResponse(
  val requestId: Long,
  val response: Error
) {
  companion object {
    fun decode(d: DataInputStream): ServerMessageRequestFailureResponse? {
      if(d.readInt() != -1870719710) return null
      val requestId = d.readLong()
      val response = Error.decode(d) ?: return null
      return ServerMessageRequestFailureResponse(
        requestId,
        response
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(-1870719710)
    s.writeLong(requestId)
    response.encode(s)
  }
}
