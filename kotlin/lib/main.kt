import com.test.app.schema.error.ErrorBadRequest
import com.test.app.schema.error.Error
import test.DeserializerByteBuffer
import test.SerializerByteBuffer

fun main(){
  val err = Error.ErrorBadRequestType(ErrorBadRequest())
  val s = SerializerByteBuffer()
  err.encode(s)
  val err2 = Error.decode(DeserializerByteBuffer(s.toByteArray()))
    ?: throw Exception("Unexpected decode result")
  if(err2 !is Error.ErrorBadRequestType) {
    throw Exception("Decoding failed")
  }
}
