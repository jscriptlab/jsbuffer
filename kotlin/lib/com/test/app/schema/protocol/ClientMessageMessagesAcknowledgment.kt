package com.test.app.schema.protocol
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class ClientMessageMessagesAcknowledgment(
  val ids: List<Long>
) : Encodable() {
  companion object {
    fun decode(d: Deserializer): ClientMessageMessagesAcknowledgment? {
      if(d.readInt() != -522163247) return null
      val lengthIds2 = d.readInt()
      val ids = mutableListOf<Long>()
      for(indexIds2 in 0..lengthIds2) {
        val itemIds2 = d.readLong()
        ids.add(itemIds2)
      }
      return ClientMessageMessagesAcknowledgment(
        ids
      )
    }
  }
  override fun encode(s: Serializer) {
    s.writeInt(-522163247)
    s.writeInt(ids.size)
    for(itemIds2 in ids) {
      s.writeLong(itemIds2)
    }
  }
}
