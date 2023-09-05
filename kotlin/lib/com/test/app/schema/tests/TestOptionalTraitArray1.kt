package com.test.app.schema.tests
import java.io.DataOutput
import java.io.DataInputStream
class TestOptionalTraitArray1(
  val value: List<List<List<Test?>>>
) {
  companion object {
    fun decode(d: DataInputStream): TestOptionalTraitArray1? {
      if(d.readInt() != 762674555) return null
      val lengthValue2 = d.readInt()
      val value = mutableListOf<List<List<Test?>>>()
      for(indexValue2 in 0..lengthValue2) {
        val lengthItemValue23 = d.readInt()
        val itemValue2 = mutableListOf<List<Test?>>()
        for(indexItemValue23 in 0..lengthItemValue23) {
          val lengthItemItemValue234 = d.readInt()
          val itemItemValue23 = mutableListOf<Test?>()
          for(indexItemItemValue234 in 0..lengthItemItemValue234) {
            val optionalByteItemItemItemValue2345 = d.readByte().toInt()
            var itemItemItemValue234: Test?
            if(optionalByteItemItemItemValue2345 == 1) {
              val actualValueItemItemItemValue2345 = Test.decode(d) ?: return null
              itemItemItemValue234 = actualValueItemItemItemValue2345
            } else if(optionalByteItemItemItemValue2345 == 0) {
              itemItemItemValue234 = null
            } else {
              return null
            }
            itemItemValue23.add(itemItemItemValue234)
          }
          itemValue2.add(itemItemValue23)
        }
        value.add(itemValue2)
      }
      return TestOptionalTraitArray1(
        value
      )
    }
  }
  fun encode(s: DataOutput) {
    s.writeInt(762674555)
    s.writeInt(value.size)
    for(itemValue2 in value) {
      s.writeInt(itemValue2.size)
      for(itemItemValue23 in itemValue2) {
        s.writeInt(itemItemValue23.size)
        for(itemItemItemValue234 in itemItemValue23) {
          if(itemItemItemValue234 != null) {
            itemItemItemValue234.encode(s)
          }
        }
      }
    }
  }
}
