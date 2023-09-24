package com.test.app.schema.request
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.main.User
sealed class RequestResponse : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): RequestResponse? {
      deserializer.mark()
      val id = deserializer.readInt()
      deserializer.reset()
      when(id) {
        -1307935086 -> {
          val result = User.decode(deserializer)
          if(result != null) return UserType(result)
        }
      }
      return null
    }
  }
  data class UserType(val value: User) : RequestResponse() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
}
