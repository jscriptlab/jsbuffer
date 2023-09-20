package com.test.app.schema.request
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.main.User
sealed class RequestResponse {
  abstract fun encode(s: Serializer)
  companion object {
    fun decode(d: Deserializer): RequestResponse? {
      d.mark()
      val id = d.readInt()
      d.reset()
      when(id) {
        -1307935086 -> {
          val result = User.decode(d)
          if(result != null) return UserType(result)
        }
      }
      return null
    }
  }
  data class UserType(val value: User) : RequestResponse() {
    override fun encode(s: Serializer) {
      value.encode(s)
    }
  }
}
