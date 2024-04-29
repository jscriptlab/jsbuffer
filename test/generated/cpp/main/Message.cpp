#include "main/Message.hpp"

main::Message main::Message::decode(jsb::deserializer& d) {
    main::Message result;
    result.id = d.read<std::uint64_t>();
    {        const auto len = d.read<std::uint32_t>();
        result.event.reserve(len);
        for (std::uint32_t i = 0; i < len; i++) {
            result.event[i] = event::Event::decode(d);
        }
    }
    return result;
}

void main::Message::encode(jsb::serializer& s) const {
    s.write<std::int32_t>(737562377);
    s.write(id);
    s.write<std::uint32_t>(event.size());
    for (const auto& item : event) {
        item.encode(s);
    }
}
