package com.test.app.schema.error
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.error.ErrorBadRequest
import com.test.app.schema.error.ErrorInternalServerError
import com.test.app.schema.error.ErrorNotFound
interface ErrorSwitch<T> {
  fun errorBadRequest(errorBadRequest: ErrorBadRequest): T
  fun errorInternalServerError(errorInternalServerError: ErrorInternalServerError): T
  fun errorNotFound(errorNotFound: ErrorNotFound): T
}
class Error(
  private val errorType: Int,
  val errorBadRequest: ErrorBadRequest?,
  val errorInternalServerError: ErrorInternalServerError?,
  val errorNotFound: ErrorNotFound?
) {
  companion object {
    fun decode(d: DataInputStream): Error? {
      d.mark(4)
      val id = d.readInt()
      d.reset()
      when(id) {
        627611118 -> {
          val result = ErrorBadRequest.decode(d)
          if(result != null) return Error(result)
        }
        990932201 -> {
          val result = ErrorInternalServerError.decode(d)
          if(result != null) return Error(result)
        }
        -1612310455 -> {
          val result = ErrorNotFound.decode(d)
          if(result != null) return Error(result)
        }
      }
      return null
    }
  }
  constructor(value: ErrorBadRequest): this(
    627611118,
    value,
    null,
    null
  )
  constructor(value: ErrorInternalServerError): this(
    990932201,
    null,
    value,
    null
  )
  constructor(value: ErrorNotFound): this(
    -1612310455,
    null,
    null,
    value
  )
  fun <T> test(testObject: ErrorSwitch<T>): T {
    when(errorType) {
      627611118 -> {
        if(errorBadRequest == null) {
          throw Exception("errorType was set to 627611118, but errorBadRequest was null")
        }
        return testObject.errorBadRequest(errorBadRequest)
      }
      990932201 -> {
        if(errorInternalServerError == null) {
          throw Exception("errorType was set to 990932201, but errorInternalServerError was null")
        }
        return testObject.errorInternalServerError(errorInternalServerError)
      }
      -1612310455 -> {
        if(errorNotFound == null) {
          throw Exception("errorType was set to -1612310455, but errorNotFound was null")
        }
        return testObject.errorNotFound(errorNotFound)
      }
    }
    throw Exception("Invalid trait data. errorType was set to $errorType, which does not match any of the type declarations that was pushed this trait. We actually expect one of the following ids:\n\n\t- 627611118\n\t- 990932201\n\t- -1612310455")
  }
  fun encode(s: DataOutput) {
    test(object : ErrorSwitch<Unit> {
      override fun errorBadRequest(errorBadRequest: ErrorBadRequest) {
        errorBadRequest.encode(s)
      }
      override fun errorInternalServerError(errorInternalServerError: ErrorInternalServerError) {
        errorInternalServerError.encode(s)
      }
      override fun errorNotFound(errorNotFound: ErrorNotFound) {
        errorNotFound.encode(s)
      }
    })
  }
}
