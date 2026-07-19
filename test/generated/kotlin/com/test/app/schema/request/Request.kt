package com.test.app.schema.request
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.post.GetPost
import com.test.app.schema.main.GetCurrentUser
sealed class Request : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): Request? {
      deserializer.mark()
      val id = deserializer.readInt()
      deserializer.reset()
      when(id) {
        -1267528456 -> {
          val result = GetPost.decode(deserializer)
          if(result != null) return GetPostType(result)
        }
        -895800374 -> {
          val result = GetCurrentUser.decode(deserializer)
          if(result != null) return GetCurrentUserType(result)
        }
      }
      return null
    }
  }
  data class GetPostType(val value: GetPost) : Request() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
  data class GetCurrentUserType(val value: GetCurrentUser) : Request() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
}
