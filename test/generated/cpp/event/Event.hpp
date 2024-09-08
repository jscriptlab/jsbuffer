#ifndef JSB_EVENT_EVENT_HPP
#define JSB_EVENT_EVENT_HPP

#include "jsb/deserializer.hpp"
#include "jsb/serializer.hpp"

namespace event {

class Event {
public:
  std::int64_t seconds;
  std::int64_t nanoseconds;
  std::uint8_t bit;
  static Event decode(jsb::deserializer&);
  void encode(jsb::serializer&) const;
};

} // namespace event
#endif // JSB_EVENT_EVENT_HPP
