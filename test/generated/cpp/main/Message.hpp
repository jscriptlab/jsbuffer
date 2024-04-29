#ifndef JSB_MAIN_MESSAGE_HPP
#define JSB_MAIN_MESSAGE_HPP

#include "event/Event.hpp"
#include <list>

#include "jsb/serializer.hpp"
#include "jsb/deserializer.hpp"

namespace main {

class Message {
public:
    std::uint64_t id;
    std::vector<event::Event> event;
    static Message decode(jsb::deserializer&);
    void encode(jsb::serializer&) const;
};

} // main
#endif // JSB_MAIN_MESSAGE_HPP
