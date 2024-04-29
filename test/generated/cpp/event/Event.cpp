#include "event/Event.hpp"

#include <stdexcept>

event::Event event::Event::decode(jsb::deserializer& d) {
    {
        const auto header = d.read<std::int32_t>();
        if(header != -56900045) {
            throw std::runtime_error("Invalid CRC header: Expected -56900045, but got " + std::to_string(header) + " instead");
        }
    }
    event::Event result;
    result.seconds = d.read<std::int64_t>();
    result.nanoseconds = d.read<std::int64_t>();
    result.bit = d.read<std::uint8_t>();
    return result;
}

void event::Event::encode(jsb::serializer& s) const {
    s.write<std::int32_t>(-56900045);
    s.write(seconds);
    s.write(nanoseconds);
    s.write(bit);
}
