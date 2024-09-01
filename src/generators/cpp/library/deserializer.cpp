#include "jsb/deserializer.hpp"

#include <stdexcept>

jsb::deserializer::deserializer(const std::vector<std::uint8_t>& buffer):
  buffer(buffer)
{}

const std::size_t& jsb::deserializer::get_offset() const {
  return offset;
}

void jsb::deserializer::assert_remaining_bytes(
    std::size_t expected_byte_count
) const  {
  std::size_t remaining_bytes = buffer.size() - offset;
  if((remaining_bytes) < expected_byte_count) {
    throw std::runtime_error(
      "Not enough bytes to read. Expected to read: " + std::to_string(expected_byte_count) + " bytes, but only " +
      std::to_string(remaining_bytes) + " bytes are available."
    );
  }
}

std::string jsb::deserializer::read_string() {
  const auto length = read<std::uint32_t>();
  assert_remaining_bytes(length);
  const auto pos = buffer.data() + offset;
  std::string decoded(pos, pos + length);
  offset += length;
  return decoded;
}

std::vector<std::uint8_t> jsb::deserializer::read_bytes(std::size_t length) {
  assert_remaining_bytes(length);
  const auto pos = buffer.data() + offset;
  std::vector<std::uint8_t> decoded(pos, pos + length);
  offset += length;
  return decoded;
}
