package com.test.app.schema.error
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.error.ErrorBadRequest
import com.test.app.schema.error.ErrorInternalServerError
import com.test.app.schema.error.ErrorNotFound
sealed class Error : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): Error? {
      deserializer.mark()
      val id = deserializer.readInt()
      deserializer.reset()
      when(id) {
        627611118 -> {
          val result = ErrorBadRequest.decode(deserializer)
          if(result != null) return ErrorBadRequestType(result)
        }
        990932201 -> {
          val result = ErrorInternalServerError.decode(deserializer)
          if(result != null) return ErrorInternalServerErrorType(result)
        }
        -1612310455 -> {
          val result = ErrorNotFound.decode(deserializer)
          if(result != null) return ErrorNotFoundType(result)
        }
      }
      return null
    }
  }
  data class ErrorBadRequestType(val value: ErrorBadRequest) : Error() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
  data class ErrorInternalServerErrorType(val value: ErrorInternalServerError) : Error() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
  data class ErrorNotFoundType(val value: ErrorNotFound) : Error() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
}
