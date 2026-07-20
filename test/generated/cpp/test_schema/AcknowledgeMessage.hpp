#ifndef JSB_TEST_SCHEMA_ACKNOWLEDGEMESSAGE_HPP
#define JSB_TEST_SCHEMA_ACKNOWLEDGEMESSAGE_HPP

#include "jsb/deserializer.hpp"
#include "jsb/serializer.hpp"

namespace test_schema {

class AcknowledgeMessage {
public:
  std::uint64_t id;
  static AcknowledgeMessage decode(jsb::deserializer&);
  void encode(jsb::serializer&) const;
};

} // namespace test_schema
#endif // JSB_TEST_SCHEMA_ACKNOWLEDGEMESSAGE_HPP
