package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.protocol.ServerMessageRequestSuccessResponse
import com.test.app.schema.protocol.ServerMessageRequestFailureResponse
sealed class ServerMessage : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): ServerMessage? {
      deserializer.mark()
      val id = deserializer.readInt()
      deserializer.reset()
      when(id) {
        -539011791 -> {
          val result = ServerMessageRequestSuccessResponse.decode(deserializer)
          if(result != null) return ServerMessageRequestSuccessResponseType(result)
        }
        -1870719710 -> {
          val result = ServerMessageRequestFailureResponse.decode(deserializer)
          if(result != null) return ServerMessageRequestFailureResponseType(result)
        }
      }
      return null
    }
  }
  data class ServerMessageRequestSuccessResponseType(val value: ServerMessageRequestSuccessResponse) : ServerMessage() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
  data class ServerMessageRequestFailureResponseType(val value: ServerMessageRequestFailureResponse) : ServerMessage() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
}
