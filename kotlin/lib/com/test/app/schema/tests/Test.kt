package com.test.app.schema.tests
import java.io.DataOutput
import java.io.DataInputStream
import com.test.app.schema.tests.TestDeepTraitArray1
import com.test.app.schema.tests.TestOptionalTraitArray1
interface TestSwitch<T> {
  fun testDeepTraitArray1(testDeepTraitArray1: TestDeepTraitArray1): T
  fun testOptionalTraitArray1(testOptionalTraitArray1: TestOptionalTraitArray1): T
}
class Test(
  private val testType: Int,
  val testDeepTraitArray1: TestDeepTraitArray1?,
  val testOptionalTraitArray1: TestOptionalTraitArray1?
) {
  companion object {
    fun decode(d: DataInputStream): Test? {
      d.mark(4)
      val id = d.readInt()
      d.reset()
      when(id) {
        -1996458609 -> {
          val result = TestDeepTraitArray1.decode(d)
          if(result != null) return Test(result)
        }
        762674555 -> {
          val result = TestOptionalTraitArray1.decode(d)
          if(result != null) return Test(result)
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
  fun <T> test(testObject: TestSwitch<T>): T {
    when(testType) {
      -1996458609 -> {
        if(testDeepTraitArray1 == null) {
          throw Exception("testType was set to -1996458609, but testDeepTraitArray1 was null")
        }
        return testObject.testDeepTraitArray1(testDeepTraitArray1)
      }
      762674555 -> {
        if(testOptionalTraitArray1 == null) {
          throw Exception("testType was set to 762674555, but testOptionalTraitArray1 was null")
        }
        return testObject.testOptionalTraitArray1(testOptionalTraitArray1)
      }
    }
    throw Exception("Invalid trait data. testType was set to $testType, which does not match any of the type declarations that was pushed this trait. We actually expect one of the following ids:\n\n\t- -1996458609\n\t- 762674555")
  }
  fun encode(s: DataOutput) {
    test(object : TestSwitch<Unit> {
      override fun testDeepTraitArray1(testDeepTraitArray1: TestDeepTraitArray1) {
        testDeepTraitArray1.encode(s)
      }
      override fun testOptionalTraitArray1(testOptionalTraitArray1: TestOptionalTraitArray1) {
        testOptionalTraitArray1.encode(s)
      }
    })
  }
}
