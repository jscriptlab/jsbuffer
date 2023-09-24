package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.protocol.ClientMessageEncrypted
import com.test.app.schema.protocol.ClientMessageMessagesAcknowledgment
import com.test.app.schema.protocol.ClientMessageRequest
sealed class ClientMessage : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): ClientMessage? {
      deserializer.mark()
      val id = deserializer.readInt()
      deserializer.reset()
      when(id) {
        1935211896 -> {
          val result = ClientMessageEncrypted.decode(deserializer)
          if(result != null) return ClientMessageEncryptedType(result)
        }
        -522163247 -> {
          val result = ClientMessageMessagesAcknowledgment.decode(deserializer)
          if(result != null) return ClientMessageMessagesAcknowledgmentType(result)
        }
        -1480887542 -> {
          val result = ClientMessageRequest.decode(deserializer)
          if(result != null) return ClientMessageRequestType(result)
        }
      }
      return null
    }
  }
  data class ClientMessageEncryptedType(val value: ClientMessageEncrypted) : ClientMessage() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
  data class ClientMessageMessagesAcknowledgmentType(val value: ClientMessageMessagesAcknowledgment) : ClientMessage() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
  data class ClientMessageRequestType(val value: ClientMessageRequest) : ClientMessage() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
}
