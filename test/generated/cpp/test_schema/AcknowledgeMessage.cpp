#include "test_schema/AcknowledgeMessage.hpp"

#include <stdexcept>

test_schema::AcknowledgeMessage
test_schema::AcknowledgeMessage::decode(jsb::deserializer& d) {
  {
    const auto header = d.read<std::int32_t>();
    if (header != -61764891) {
      throw std::runtime_error(
          "Invalid CRC header: Expected -61764891, but got " +
          std::to_string(header) + " instead");
    }
  }
  test_schema::AcknowledgeMessage result;
  result.id = d.read<std::uint64_t>();
  return result;
}

void test_schema::AcknowledgeMessage::encode(jsb::serializer& s) const {
  s.write<std::int32_t>(-61764891);
  s.write(id);
}
