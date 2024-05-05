#ifndef JSB_INDEX_IMPORTLOCALTYPE_HPP
#define JSB_INDEX_IMPORTLOCALTYPE_HPP

#include "index/Message.hpp"

#include "jsb/serializer.hpp"
#include "jsb/deserializer.hpp"

namespace index {

class ImportLocalType {
public:
    index::Message message;
    static ImportLocalType decode(jsb::deserializer&);
    void encode(jsb::serializer&) const;
};

} // index
#endif // JSB_INDEX_IMPORTLOCALTYPE_HPP
