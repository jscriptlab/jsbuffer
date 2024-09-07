#ifndef JSB_TEST_SCHEMA_ACKNOWLEDGEMESSAGE_HPP
#define JSB_TEST_SCHEMA_ACKNOWLEDGEMESSAGE_HPP


#include "jsb/serializer.hpp"
#include "jsb/deserializer.hpp"

namespace test_schema {

class AcknowledgeMessage {
public:
    std::uint64_t id;
    static AcknowledgeMessage decode(jsb::deserializer&);
    void encode(jsb::serializer&) const;
};

} // test_schema
#endif // JSB_TEST_SCHEMA_ACKNOWLEDGEMESSAGE_HPP
