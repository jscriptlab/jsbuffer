package com.test.app.schema.request
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.main.User
interface RequestResponseSwitch<T> {
  fun user(user: User): T
}
class RequestResponse(
  private val requestResponseType: Int,
  val user: User?
) {
  companion object {
    fun decode(d: DataInputStream): RequestResponse? {
      d.mark(4)
      val id = d.readInt()
      d.reset()
      when(id) {
        -1307935086 -> {
          val result = User.decode(d)
          if(result != null) return RequestResponse(result)
        }
      }
      return null
    }
  }
  constructor(value: User): this(
    -1307935086,
    value
  )
  fun <T> test(testObject: RequestResponseSwitch<T>): T {
    when(requestResponseType) {
      -1307935086 -> {
        if(user == null) {
          throw Exception("requestResponseType was set to -1307935086, but user was null")
        }
        return testObject.user(user)
      }
    }
    throw Exception("Invalid trait data. requestResponseType was set to $requestResponseType, which does not match any of the type declarations that was pushed this trait. We actually expect one of the following ids:\n\n\t- -1307935086")
  }
  fun encode(s: DataOutput) {
    test(object : RequestResponseSwitch<Unit> {
      override fun user(user: User) {
        user.encode(s)
      }
    })
  }
}
