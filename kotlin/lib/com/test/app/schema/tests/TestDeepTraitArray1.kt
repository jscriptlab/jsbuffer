package com.test.app.schema.tests
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
class TestDeepTraitArray1(
  val value: List<List<List<Test>>>
) {
  companion object {
    fun decode(d: Deserializer): TestDeepTraitArray1? {
      if(d.readInt() != -1996458609) return null
      val lengthValue2 = d.readInt()
      val value = mutableListOf<List<List<Test>>>()
      for(indexValue2 in 0..lengthValue2) {
        val lengthItemValue23 = d.readInt()
        val itemValue2 = mutableListOf<List<Test>>()
        for(indexItemValue23 in 0..lengthItemValue23) {
          val lengthItemItemValue234 = d.readInt()
          val itemItemValue23 = mutableListOf<Test>()
          for(indexItemItemValue234 in 0..lengthItemItemValue234) {
            val itemItemItemValue234 = Test.decode(d) ?: return null
            itemItemValue23.add(itemItemItemValue234)
          }
          itemValue2.add(itemItemValue23)
        }
        value.add(itemValue2)
      }
      return TestDeepTraitArray1(
        value
      )
    }
  }
  fun encode(s: Serializer) {
    s.writeInt(-1996458609)
    s.writeInt(value.size)
    for(itemValue2 in value) {
      s.writeInt(itemValue2.size)
      for(itemItemValue23 in itemValue2) {
        s.writeInt(itemItemValue23.size)
        for(itemItemItemValue234 in itemItemValue23) {
          itemItemItemValue234.encode(s)
        }
      }
    }
  }
}
