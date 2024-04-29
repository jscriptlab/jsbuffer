#ifndef JSB_MAIN_ACKNOWLEDGEMESSAGE_HPP
#define JSB_MAIN_ACKNOWLEDGEMESSAGE_HPP


#include "jsb/serializer.hpp"
#include "jsb/deserializer.hpp"

namespace main {

class AcknowledgeMessage {
public:
    std::uint64_t id;
    static AcknowledgeMessage decode(jsb::deserializer&);
    void encode(jsb::serializer&) const;
};

} // main
#endif // JSB_MAIN_ACKNOWLEDGEMESSAGE_HPP
