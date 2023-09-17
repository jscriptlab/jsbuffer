package test

import com.test.app.schema.internal.Deserializer

import java.nio.ByteBuffer
import java.nio.ByteOrder

class DeserializerByteBuffer(byteArray: ByteArray, order: ByteOrder = ByteOrder.LITTLE_ENDIAN) : Deserializer {
  private var markedOffset: Int? = null
  private var buffer: ByteBuffer
  
  init {
    buffer = ByteBuffer.allocateDirect(byteArray.size)
    buffer.put(byteArray).order(order).flip()
    markedOffset = null
  }
  
  override fun readInt(): Int {
    return buffer.getInt()
  }

  override fun mark() {
    markedOffset = buffer.position()
  }

  override fun reset() {
    if(markedOffset === null){
      throw Exception("No offset was marked: You should call mark() before reset()")
    }
    markedOffset?.let { buffer.position(it) }
  }

  override fun readLong(): Long {
    return buffer.getLong()
  }

  override fun readDouble(): Double {
    return buffer.getDouble()
  }

  override fun readFloat(): Float {
    return buffer.getFloat()
  }

  override fun readShort(): Short {
    return buffer.getShort()
  }

  override fun readByte(): Byte {
    return buffer.getChar().code.toByte()
  }

  override fun read(value: ByteArray) {
    buffer.get(value)
  }

}
