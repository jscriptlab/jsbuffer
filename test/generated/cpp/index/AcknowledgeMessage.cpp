#include "index/AcknowledgeMessage.hpp"

#include <stdexcept>

index::AcknowledgeMessage index::AcknowledgeMessage::decode(jsb::deserializer& d) {
    {
        const auto header = d.read<std::int32_t>();
        if(header != -1282210624) {
            throw std::runtime_error("Invalid CRC header: Expected -1282210624, but got " + std::to_string(header) + " instead");
        }
    }
    index::AcknowledgeMessage result;
    result.id = d.read<std::uint64_t>();
    return result;
}

void index::AcknowledgeMessage::encode(jsb::serializer& s) const {
    s.write<std::int32_t>(-1282210624);
    s.write(id);
}
