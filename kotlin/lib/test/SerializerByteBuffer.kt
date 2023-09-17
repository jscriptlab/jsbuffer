package test

import com.test.app.schema.internal.Serializer
import java.nio.ByteBuffer
import java.nio.ByteOrder

class SerializerByteBuffer(
  private val order: ByteOrder = ByteOrder.LITTLE_ENDIAN,
  private val initialCapacity: Int = 1024 * 1024 * 2
) : Serializer {
  private var buffer = ByteBuffer.allocateDirect(initialCapacity).order(order)

  fun toByteArray(): ByteArray {
    val length = buffer.position()
    buffer.flip()
    val out = ByteArray(length)
    buffer.get(out)
    return out
  }

  override fun writeInt(value: Int) {
    buffer.putInt(value)
  }

  override fun writeLong(value: Long) {
    buffer.putLong(value)
  }

  override fun writeDouble(value: Double) {
    buffer.putDouble(value)
  }

  override fun writeFloat(value: Float) {
    buffer.putFloat(value)
  }

  override fun writeShort(value: Short) {
    buffer.putShort(value)
  }

  override fun writeByte(value: Byte) {
    buffer.put(value)
  }

  override fun write(value: ByteArray) {
    buffer.put(value)
  }

  private fun maybeReallocate(byteLength: Int) {
    val oldBuffer = buffer
    val remainingBytes = buffer.remaining()
    if(remainingBytes <= byteLength){
      buffer = ByteBuffer.allocateDirect(buffer.capacity() + initialCapacity + byteLength).order(order)
      buffer.put(oldBuffer)
    }
  }

}