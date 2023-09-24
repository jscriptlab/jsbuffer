package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.protocol.ClientMessageEncrypted
import com.test.app.schema.protocol.ClientMessageMessagesAcknowledgment
import com.test.app.schema.protocol.ClientMessageRequest
sealed class ClientMessage : Encodable() {
  companion object {
    fun decode(d: Deserializer): ClientMessage? {
      d.mark()
      val id = d.readInt()
      d.reset()
      when(id) {
        1935211896 -> {
          val result = ClientMessageEncrypted.decode(d)
          if(result != null) return ClientMessageEncryptedType(result)
        }
        -522163247 -> {
          val result = ClientMessageMessagesAcknowledgment.decode(d)
          if(result != null) return ClientMessageMessagesAcknowledgmentType(result)
        }
        -1480887542 -> {
          val result = ClientMessageRequest.decode(d)
          if(result != null) return ClientMessageRequestType(result)
        }
      }
      return null
    }
  }
  data class ClientMessageEncryptedType(val value: ClientMessageEncrypted) : ClientMessage() {
    override fun encode(s: Serializer) {
      value.encode(s)
    }
  }
  data class ClientMessageMessagesAcknowledgmentType(val value: ClientMessageMessagesAcknowledgment) : ClientMessage() {
    override fun encode(s: Serializer) {
      value.encode(s)
    }
  }
  data class ClientMessageRequestType(val value: ClientMessageRequest) : ClientMessage() {
    override fun encode(s: Serializer) {
      value.encode(s)
    }
  }
}
