#ifndef JSB_SCHEMA_INTERNAL_TEST_INTERNAL_IMPORTMEWITHID_HPP
#define JSB_SCHEMA_INTERNAL_TEST_INTERNAL_IMPORTMEWITHID_HPP

#include "test/ImportMe.hpp"

#include "jsb/deserializer.hpp"
#include "jsb/serializer.hpp"

namespace schema_internal_test::internal {

class ImportMeWithId {
public:
  std::uint32_t id;
  test::ImportMe data;
  static ImportMeWithId decode(jsb::deserializer&);
  void encode(jsb::serializer&) const;
};

} // namespace schema_internal_test::internal
#endif // JSB_SCHEMA_INTERNAL_TEST_INTERNAL_IMPORTMEWITHID_HPP
