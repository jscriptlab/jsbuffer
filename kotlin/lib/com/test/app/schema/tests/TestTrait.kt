package com.test.app.schema.tests
import com.test.app.schema.internal.Serializer
import com.test.app.schema.internal.Deserializer
import com.test.app.schema.tests.TestDeepTraitArray1
import com.test.app.schema.tests.TestOptionalTraitArray1
interface TestTraitSwitch<T> {
  fun testDeepTraitArray1(testDeepTraitArray1: TestDeepTraitArray1): T
  fun testOptionalTraitArray1(testOptionalTraitArray1: TestOptionalTraitArray1): T
}
class TestTrait(
  private val testTraitType: Int,
  val testDeepTraitArray1: TestDeepTraitArray1?,
  val testOptionalTraitArray1: TestOptionalTraitArray1?
) {
  companion object {
    fun decode(d: Deserializer): TestTrait? {
      d.mark()
      val id = d.readInt()
      d.reset()
      when(id) {
        -1996458609 -> {
          val result = TestDeepTraitArray1.decode(d)
          if(result != null) return TestTrait(result)
        }
        762674555 -> {
          val result = TestOptionalTraitArray1.decode(d)
          if(result != null) return TestTrait(result)
        }
      }
      return null
    }
  }
  constructor(value: TestDeepTraitArray1): this(
    -1996458609,
    value,
    null
  )
  constructor(value: TestOptionalTraitArray1): this(
    762674555,
    null,
    value
  )
  fun <T> test(testObject: TestTraitSwitch<T>): T {
    when(testTraitType) {
      -1996458609 -> {
        if(testDeepTraitArray1 == null) {
          throw Exception("testTraitType was set to -1996458609, but testDeepTraitArray1 was null")
        }
        return testObject.testDeepTraitArray1(testDeepTraitArray1)
      }
      762674555 -> {
        if(testOptionalTraitArray1 == null) {
          throw Exception("testTraitType was set to 762674555, but testOptionalTraitArray1 was null")
        }
        return testObject.testOptionalTraitArray1(testOptionalTraitArray1)
      }
    }
    throw Exception("Invalid trait data. testTraitType was set to $testTraitType, which does not match any of the type declarations that was pushed this trait. We actually expect one of the following ids:\n\n\t- -1996458609\n\t- 762674555")
  }
  fun encode(s: Serializer) {
    test(object : TestTraitSwitch<Unit> {
      override fun testDeepTraitArray1(testDeepTraitArray1: TestDeepTraitArray1) {
        testDeepTraitArray1.encode(s)
      }
      override fun testOptionalTraitArray1(testOptionalTraitArray1: TestOptionalTraitArray1) {
        testOptionalTraitArray1.encode(s)
      }
    })
  }
}
