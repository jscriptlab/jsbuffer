#include "test_schema/Message.hpp"

#include <stdexcept>

test_schema::Message test_schema::Message::decode(jsb::deserializer& d) {
    {
        const auto header = d.read<std::int32_t>();
        if(header != -1322944567) {
            throw std::runtime_error("Invalid CRC header: Expected -1322944567, but got " + std::to_string(header) + " instead");
        }
    }
    test_schema::Message result;
    result.id = d.read<std::uint64_t>();
    {
        const auto len = d.read<std::uint32_t>();
        result.event.resize(len);
        for (std::uint32_t i = 0; i < len; i++) {
            result.event[i] = event::Event::decode(d);
        }
    }
    return result;
}

void test_schema::Message::encode(jsb::serializer& s) const {
    s.write<std::int32_t>(-1322944567);
    s.write(id);
    s.write<std::uint32_t>(event.size());
    for (const auto& item : event) {
        item.encode(s);
    }
}
