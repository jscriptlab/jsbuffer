#include "index/ImportLocalType.hpp"

#include <stdexcept>

index::ImportLocalType index::ImportLocalType::decode(jsb::deserializer& d) {
    {
        const auto header = d.read<std::int32_t>();
        if(header != 1331707981) {
            throw std::runtime_error("Invalid CRC header: Expected 1331707981, but got " + std::to_string(header) + " instead");
        }
    }
    index::ImportLocalType result;
    result.message = index::Message::decode(d);
    return result;
}

void index::ImportLocalType::encode(jsb::serializer& s) const {
    s.write<std::int32_t>(1331707981);
    message.encode(s);
}
