package com.test.app.schema.main
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class Comment(
  val id: Int,
  val postId: Long,
  val text: String
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): Comment? {
      if(deserializer.readInt() != -1202685592) return null
      val id = deserializer.readInt()
      val postId = deserializer.readLong()
      val textAsByteArray3 = ByteArray(deserializer.readInt())
      deserializer.read(textAsByteArray3)
      val text = String(textAsByteArray3, Charsets.UTF_8)
      return Comment(
        id,
        postId,
        text
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(-1202685592)
    serializer.writeInt(id)
    serializer.writeLong(postId)
    val batext3 = text.toByteArray(Charsets.UTF_8)
    serializer.writeInt(batext3.size)
    serializer.write(batext3)
  }
}
