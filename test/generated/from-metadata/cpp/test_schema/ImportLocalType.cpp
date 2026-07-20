#include "test_schema/ImportLocalType.hpp"

#include <stdexcept>

test_schema::ImportLocalType test_schema::ImportLocalType::decode(jsb::deserializer& d) {
    {
        const auto header = d.read<std::int32_t>();
        if(header != -2079881379) {
            throw std::runtime_error("Invalid CRC header: Expected -2079881379, but got " + std::to_string(header) + " instead");
        }
    }
    test_schema::ImportLocalType result;
    result.message = test_schema::Message::decode(d);
    return result;
}

void test_schema::ImportLocalType::encode(jsb::serializer& s) const {
    s.write<std::int32_t>(-2079881379);
    message.encode(s);
}
