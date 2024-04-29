#ifndef JSB_INDEX_MESSAGE_HPP
#define JSB_INDEX_MESSAGE_HPP

#include "event/Event.hpp"
#include <list>

#include "jsb/serializer.hpp"
#include "jsb/deserializer.hpp"

namespace index {

class Message {
public:
    std::uint64_t id;
    std::vector<event::Event> event;
    static Message decode(jsb::deserializer&);
    void encode(jsb::serializer&) const;
};

} // index
#endif // JSB_INDEX_MESSAGE_HPP
