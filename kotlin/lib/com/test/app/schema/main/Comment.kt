package com.test.app.schema.main
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
class Comment(
  val id: Int,
  val postId: Long,
  val text: String
) {
  companion object {
    fun decode(d: Deserializer): Comment? {
      if(d.readInt() != -1202685592) return null
      val id = d.readInt()
      val postId = d.readLong()
      val textAsByteArray3 = ByteArray(d.readInt())
      d.read(textAsByteArray3)
      val text = String(textAsByteArray3, Charsets.UTF_8)
      return Comment(
        id,
        postId,
        text
      )
    }
  }
  fun encode(s: Serializer) {
    s.writeInt(-1202685592)
    s.writeInt(id)
    s.writeLong(postId)
    val batext3 = text.toByteArray(Charsets.UTF_8)
    s.writeInt(batext3.size)
    s.write(batext3)
  }
}
