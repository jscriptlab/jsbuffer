package com.test.app.schema.protocol
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.protocol.ServerMessageRequestSuccessResponse
import com.test.app.schema.protocol.ServerMessageRequestFailureResponse
interface ServerMessageSwitch<T> {
  fun serverMessageRequestSuccessResponse(serverMessageRequestSuccessResponse: ServerMessageRequestSuccessResponse): T
  fun serverMessageRequestFailureResponse(serverMessageRequestFailureResponse: ServerMessageRequestFailureResponse): T
}
class ServerMessage(
  private val serverMessageType: Int,
  val serverMessageRequestSuccessResponse: ServerMessageRequestSuccessResponse?,
  val serverMessageRequestFailureResponse: ServerMessageRequestFailureResponse?
) {
  companion object {
    fun decode(d: DataInputStream): ServerMessage? {
      d.mark(4)
      val id = d.readInt()
      d.reset()
      when(id) {
        -539011791 -> {
          val result = ServerMessageRequestSuccessResponse.decode(d)
          if(result != null) return ServerMessage(result)
        }
        -1870719710 -> {
          val result = ServerMessageRequestFailureResponse.decode(d)
          if(result != null) return ServerMessage(result)
        }
      }
      return null
    }
  }
  constructor(value: ServerMessageRequestSuccessResponse): this(
    -539011791,
    value,
    null
  )
  constructor(value: ServerMessageRequestFailureResponse): this(
    -1870719710,
    null,
    value
  )
  fun <T> test(testObject: ServerMessageSwitch<T>): T {
    when(serverMessageType) {
      -539011791 -> {
        if(serverMessageRequestSuccessResponse == null) {
          throw Exception("serverMessageType was set to -539011791, but serverMessageRequestSuccessResponse was null")
        }
        return testObject.serverMessageRequestSuccessResponse(serverMessageRequestSuccessResponse)
      }
      -1870719710 -> {
        if(serverMessageRequestFailureResponse == null) {
          throw Exception("serverMessageType was set to -1870719710, but serverMessageRequestFailureResponse was null")
        }
        return testObject.serverMessageRequestFailureResponse(serverMessageRequestFailureResponse)
      }
    }
    throw Exception("Invalid trait data. serverMessageType was set to $serverMessageType, which does not match any of the type declarations that was pushed this trait. We actually expect one of the following ids:\n\n\t- -539011791\n\t- -1870719710")
  }
  fun encode(s: DataOutput) {
    test(object : ServerMessageSwitch<Unit> {
      override fun serverMessageRequestSuccessResponse(serverMessageRequestSuccessResponse: ServerMessageRequestSuccessResponse) {
        serverMessageRequestSuccessResponse.encode(s)
      }
      override fun serverMessageRequestFailureResponse(serverMessageRequestFailureResponse: ServerMessageRequestFailureResponse) {
        serverMessageRequestFailureResponse.encode(s)
      }
    })
  }
}
