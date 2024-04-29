#include "main/AcknowledgeMessage.hpp"

main::AcknowledgeMessage main::AcknowledgeMessage::decode(jsb::deserializer& d) {
    main::AcknowledgeMessage result;
    result.id = d.read<std::uint64_t>();
    return result;
}

void main::AcknowledgeMessage::encode(jsb::serializer& s) const {
    s.write<std::int32_t>(389032954);
    s.write(id);
}
