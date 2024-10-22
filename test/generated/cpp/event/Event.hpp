#ifndef JSB_EVENT_EVENT_HPP
#define JSB_EVENT_EVENT_HPP


#include "jsb/serializer.hpp"
#include "jsb/deserializer.hpp"

namespace event {

class Event {
public:
    std::int64_t seconds;
    std::int64_t nanoseconds;
    std::uint8_t bit;
    static Event decode(jsb::deserializer&);
    void encode(jsb::serializer&) const;
};

} // event
#endif // JSB_EVENT_EVENT_HPP
