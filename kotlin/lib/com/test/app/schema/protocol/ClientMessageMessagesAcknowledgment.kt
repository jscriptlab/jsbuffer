package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class ClientMessageMessagesAcknowledgment(
  val ids: List<Long>
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): ClientMessageMessagesAcknowledgment? {
      if(deserializer.readInt() != -522163247) return null
      val lengthIds2 = deserializer.readInt()
      val ids = mutableListOf<Long>()
      for(indexIds2 in 0..lengthIds2) {
        val itemIds2 = deserializer.readLong()
        ids.add(itemIds2)
      }
      return ClientMessageMessagesAcknowledgment(
        ids
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-522163247)
    serializer.writeInt(ids.size)
    for(itemIds2 in ids) {
      serializer.writeLong(itemIds2)
    }
  }
}
