package com.test.app.schema.protocol
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.protocol.ClientMessageEncrypted
import com.test.app.schema.protocol.ClientMessageMessagesAcknowledgment
import com.test.app.schema.protocol.ClientMessageRequest
interface ClientMessageSwitch<T> {
  fun clientMessageEncrypted(clientMessageEncrypted: ClientMessageEncrypted): T
  fun clientMessageMessagesAcknowledgment(clientMessageMessagesAcknowledgment: ClientMessageMessagesAcknowledgment): T
  fun clientMessageRequest(clientMessageRequest: ClientMessageRequest): T
}
class ClientMessage(
  private val clientMessageType: Int,
  val clientMessageEncrypted: ClientMessageEncrypted?,
  val clientMessageMessagesAcknowledgment: ClientMessageMessagesAcknowledgment?,
  val clientMessageRequest: ClientMessageRequest?
) {
  companion object {
    fun decode(d: DataInputStream): ClientMessage? {
      d.mark(4)
      val id = d.readInt()
      d.reset()
      when(id) {
        1935211896 -> {
          val result = ClientMessageEncrypted.decode(d)
          if(result != null) return ClientMessage(result)
        }
        -522163247 -> {
          val result = ClientMessageMessagesAcknowledgment.decode(d)
          if(result != null) return ClientMessage(result)
        }
        -1480887542 -> {
          val result = ClientMessageRequest.decode(d)
          if(result != null) return ClientMessage(result)
        }
      }
      return null
    }
  }
  constructor(value: ClientMessageEncrypted): this(
    1935211896,
    value,
    null,
    null
  )
  constructor(value: ClientMessageMessagesAcknowledgment): this(
    -522163247,
    null,
    value,
    null
  )
  constructor(value: ClientMessageRequest): this(
    -1480887542,
    null,
    null,
    value
  )
  fun <T> test(testObject: ClientMessageSwitch<T>): T {
    when(clientMessageType) {
      1935211896 -> {
        if(clientMessageEncrypted == null) {
          throw Exception("clientMessageType was set to 1935211896, but clientMessageEncrypted was null")
        }
        return testObject.clientMessageEncrypted(clientMessageEncrypted)
      }
      -522163247 -> {
        if(clientMessageMessagesAcknowledgment == null) {
          throw Exception("clientMessageType was set to -522163247, but clientMessageMessagesAcknowledgment was null")
        }
        return testObject.clientMessageMessagesAcknowledgment(clientMessageMessagesAcknowledgment)
      }
      -1480887542 -> {
        if(clientMessageRequest == null) {
          throw Exception("clientMessageType was set to -1480887542, but clientMessageRequest was null")
        }
        return testObject.clientMessageRequest(clientMessageRequest)
      }
    }
    throw Exception("Invalid trait data. clientMessageType was set to $clientMessageType, which does not match any of the type declarations that was pushed this trait. We actually expect one of the following ids:\n\n\t- 1935211896\n\t- -522163247\n\t- -1480887542")
  }
  fun encode(s: DataOutput) {
    test(object : ClientMessageSwitch<Unit> {
      override fun clientMessageEncrypted(clientMessageEncrypted: ClientMessageEncrypted) {
        clientMessageEncrypted.encode(s)
      }
      override fun clientMessageMessagesAcknowledgment(clientMessageMessagesAcknowledgment: ClientMessageMessagesAcknowledgment) {
        clientMessageMessagesAcknowledgment.encode(s)
      }
      override fun clientMessageRequest(clientMessageRequest: ClientMessageRequest) {
        clientMessageRequest.encode(s)
      }
    })
  }
}
