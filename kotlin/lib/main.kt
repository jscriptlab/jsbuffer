import com.test.app.schema.error.ErrorBadRequest
import com.test.app.schema.error.Error
import com.test.app.schema.error.ErrorSwitch
import com.test.app.schema.error.ErrorInternalServerError
import com.test.app.schema.error.ErrorNotFound
import test.DeserializerByteBuffer
import test.SerializerByteBuffer

fun main(){
  val err = Error(ErrorBadRequest())
  val s = SerializerByteBuffer()
  err.encode(s)
  val err2 = Error.decode(DeserializerByteBuffer(s.toByteArray()))
    ?: throw Exception("Unexpected decode result")
  var isBadRequest = false
  err2.test(object : ErrorSwitch<Unit>{    
    override fun errorBadRequest(errorBadRequest: ErrorBadRequest) {
      isBadRequest = true
    }
    override fun errorInternalServerError(errorInternalServerError: ErrorInternalServerError) {
      throw Exception("Decoding failed")
    }
    override fun errorNotFound(errorNotFound: ErrorNotFound) {
      throw Exception("Decoding failed")
    }
  })
  if(!isBadRequest){
    throw Exception("Decoding failed")
  }
}