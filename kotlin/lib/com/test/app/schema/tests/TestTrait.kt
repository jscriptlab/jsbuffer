package com.test.app.schema.tests
import com.test.app.schema.internal.Encodable
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.internal.Serializer
import com.test.app.schema.tests.TestDeepTraitArray1
import com.test.app.schema.tests.TestOptionalTraitArray1
sealed class TestTrait : Encodable() {
  companion object {
    fun decode(deserializer: Deserializer): TestTrait? {
      deserializer.mark()
      val id = deserializer.readInt()
      deserializer.reset()
      when(id) {
        -1996458609 -> {
          val result = TestDeepTraitArray1.decode(deserializer)
          if(result != null) return TestDeepTraitArray1Type(result)
        }
        762674555 -> {
          val result = TestOptionalTraitArray1.decode(deserializer)
          if(result != null) return TestOptionalTraitArray1Type(result)
        }
      }
      return null
    }
  }
  data class TestDeepTraitArray1Type(val value: TestDeepTraitArray1) : TestTrait() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
  data class TestOptionalTraitArray1Type(val value: TestOptionalTraitArray1) : TestTrait() {
    override fun encode(serializer: Serializer) {
      value.encode(serializer)
    }
  }
}
