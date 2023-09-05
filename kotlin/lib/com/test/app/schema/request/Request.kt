package com.test.app.schema.request
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.post.GetPost
import com.test.app.schema.main.GetCurrentUser
interface RequestSwitch<T> {
  fun getPost(getPost: GetPost): T
  fun getCurrentUser(getCurrentUser: GetCurrentUser): T
}
class Request(
  private val requestType: Int,
  val getPost: GetPost?,
  val getCurrentUser: GetCurrentUser?
) {
  companion object {
    fun decode(d: DataInputStream): Request? {
      d.mark(4)
      val id = d.readInt()
      d.reset()
      when(id) {
        -1267528456 -> {
          val result = GetPost.decode(d)
          if(result != null) return Request(result)
        }
        -895800374 -> {
          val result = GetCurrentUser.decode(d)
          if(result != null) return Request(result)
        }
      }
      return null
    }
  }
  constructor(value: GetPost): this(
    -1267528456,
    value,
    null
  )
  constructor(value: GetCurrentUser): this(
    -895800374,
    null,
    value
  )
  fun <T> test(testObject: RequestSwitch<T>): T {
    when(requestType) {
      -1267528456 -> {
        if(getPost == null) {
          throw Exception("requestType was set to -1267528456, but getPost was null")
        }
        return testObject.getPost(getPost)
      }
      -895800374 -> {
        if(getCurrentUser == null) {
          throw Exception("requestType was set to -895800374, but getCurrentUser was null")
        }
        return testObject.getCurrentUser(getCurrentUser)
      }
    }
    throw Exception("Invalid trait data. requestType was set to $requestType, which does not match any of the type declarations that was pushed this trait. We actually expect one of the following ids:\n\n\t- -1267528456\n\t- -895800374")
  }
  fun encode(s: DataOutput) {
    test(object : RequestSwitch<Unit> {
      override fun getPost(getPost: GetPost) {
        getPost.encode(s)
      }
      override fun getCurrentUser(getCurrentUser: GetCurrentUser) {
        getCurrentUser.encode(s)
      }
    })
  }
}
