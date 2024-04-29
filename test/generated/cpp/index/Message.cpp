#include "index/Message.hpp"

#include <stdexcept>

index::Message index::Message::decode(jsb::deserializer& d) {
    {
        const auto header = d.read<std::int32_t>();
        if(header != 1607067092) {
            throw std::runtime_error("Invalid CRC header: Expected 1607067092, but got " + std::to_string(header) + " instead");
        }
    }
    index::Message result;
    result.id = d.read<std::uint64_t>();
    {
        const auto len = d.read<std::uint32_t>();
        result.event.reserve(len);
        for (std::uint32_t i = 0; i < len; i++) {
            result.event[i] = event::Event::decode(d);
        }
    }
    return result;
}

void index::Message::encode(jsb::serializer& s) const {
    s.write<std::int32_t>(1607067092);
    s.write(id);
    s.write<std::uint32_t>(event.size());
    for (const auto& item : event) {
        item.encode(s);
    }
}
