package com.test.app.schema.internal

import com.test.app.schema.internal.Serializer

abstract class Encodable {
  abstract fun encode(s: Serializer)
}
