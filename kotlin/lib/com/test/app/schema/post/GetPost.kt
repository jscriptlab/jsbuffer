package com.test.app.schema.post
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.request.Request
class GetPost(
  val id: Int
) {
  companion object {
    fun decode(d: DataInputStream): GetPost? {
      if(d.readInt() != -1267528456) return null
      val id = d.readInt()
      return GetPost(
        id
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(-1267528456)
    s.writeInt(id)
  }
}
