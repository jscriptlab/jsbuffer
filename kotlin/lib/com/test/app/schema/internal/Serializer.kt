package com.test.app.schema.internal

interface Serializer {
  fun writeInt(value: Int): Unit
  fun writeLong(value: Long): Unit
  fun writeDouble(value: Double): Unit
  fun writeFloat(value: Float): Unit
  fun writeShort(value: Short): Unit
  fun writeByte(value: Byte): Unit
  fun write(value: ByteArray): Unit
}
