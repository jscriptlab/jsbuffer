package com.test.app.schema.internal

interface Deserializer {
  fun readInt(): Int
  fun mark(): Unit
  fun reset(): Unit
  fun readLong(): Long
  fun readDouble(): Double
  fun readFloat(): Float
  fun readShort(): Short
  fun readByte(): Byte
  fun read(value: ByteArray): Unit
}
