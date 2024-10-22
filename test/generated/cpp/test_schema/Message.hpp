#ifndef JSB_TEST_SCHEMA_MESSAGE_HPP
#define JSB_TEST_SCHEMA_MESSAGE_HPP

#include "event/Event.hpp"
#include <list>

#include "jsb/deserializer.hpp"
#include "jsb/serializer.hpp"

namespace test_schema {

class Message {
public:
  std::uint64_t id;
  std::vector<event::Event> event;
  static Message decode(jsb::deserializer&);
  void encode(jsb::serializer&) const;
};

} // namespace test_schema
#endif // JSB_TEST_SCHEMA_MESSAGE_HPP
