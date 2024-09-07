#ifndef JSB_TEST_SCHEMA_MESSAGE_HPP
#define JSB_TEST_SCHEMA_MESSAGE_HPP

#include "event/Event.hpp"
#include <list>

#include "jsb/serializer.hpp"
#include "jsb/deserializer.hpp"

namespace test_schema {

class Message {
public:
    std::uint64_t id;
    std::vector<event::Event> event;
    static Message decode(jsb::deserializer&);
    void encode(jsb::serializer&) const;
};

} // test_schema
#endif // JSB_TEST_SCHEMA_MESSAGE_HPP
