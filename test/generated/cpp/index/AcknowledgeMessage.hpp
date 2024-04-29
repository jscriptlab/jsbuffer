#ifndef JSB_INDEX_ACKNOWLEDGEMESSAGE_HPP
#define JSB_INDEX_ACKNOWLEDGEMESSAGE_HPP


#include "jsb/serializer.hpp"
#include "jsb/deserializer.hpp"

namespace index {

class AcknowledgeMessage {
public:
    std::uint64_t id;
    static AcknowledgeMessage decode(jsb::deserializer&);
    void encode(jsb::serializer&) const;
};

} // index
#endif // JSB_INDEX_ACKNOWLEDGEMESSAGE_HPP
