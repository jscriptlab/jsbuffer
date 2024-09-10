#ifndef JSB_TEST_SCHEMA_IMPORTLOCALTYPE_HPP
#define JSB_TEST_SCHEMA_IMPORTLOCALTYPE_HPP

#include "test_schema/Message.hpp"

#include "jsb/deserializer.hpp"
#include "jsb/serializer.hpp"

namespace test_schema {

class ImportLocalType {
public:
  test_schema::Message message;
  static ImportLocalType decode(jsb::deserializer&);
  void encode(jsb::serializer&) const;
};

} // namespace test_schema
#endif // JSB_TEST_SCHEMA_IMPORTLOCALTYPE_HPP
