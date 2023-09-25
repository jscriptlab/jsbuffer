package com.test.app.schema.tests
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
class TestOptionalTraitArray1(
  val value: List<List<List<Test?>>>
) : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): TestOptionalTraitArray1? {
      if(deserializer.readInt() != 762674555) return null
      val lengthValue2 = deserializer.readInt()
      val value = (0 until lengthValue2).map {
        val lengthItemValue23 = deserializer.readInt()
        val itemValue2 = (0 until lengthItemValue23).map {
          val lengthItemItemValue234 = deserializer.readInt()
          val itemItemValue23 = (0 until lengthItemItemValue234).map {
            val optionalByteItemItemItemValue2345 = deserializer.readByte().toInt()
            var itemItemItemValue234: Test?
            if(optionalByteItemItemItemValue2345 == 1) {
              val actualValueItemItemItemValue2345 = Test.decode(deserializer) ?: return null
              itemItemItemValue234 = actualValueItemItemItemValue2345
            } else if(optionalByteItemItemItemValue2345 == 0) {
              itemItemItemValue234 = null
            } else {
              return null
            }
            itemItemItemValue234
          }
          itemItemValue23
        }
        itemValue2
      }
      return TestOptionalTraitArray1(
        value
      )
    }
  }
  override fun encode(serializer: Serializer) {
    serializer.writeInt(762674555)
    serializer.writeInt(value.size)
    for(itemValue2 in value) {
      serializer.writeInt(itemValue2.size)
      for(itemItemValue23 in itemValue2) {
        serializer.writeInt(itemItemValue23.size)
        for(itemItemItemValue234 in itemItemValue23) {
          if(itemItemItemValue234 != null) {
            itemItemItemValue234.encode(serializer)
          }
        }
      }
    }
  }
}
