package com.test.app.schema.protocol
import java.io.DataOutput
import java.io.DataInputStream
class ClientMessageMessagesAcknowledgment(
  val ids: List<Long>
) {
  companion object {
    fun decode(d: DataInputStream): ClientMessageMessagesAcknowledgment? {
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
  fun encode(s: DataOutput) {
    s.writeInt(-522163247)
    s.writeInt(ids.size)
    for(itemIds2 in ids) {
      s.writeLong(itemIds2)
    }
  }
}
