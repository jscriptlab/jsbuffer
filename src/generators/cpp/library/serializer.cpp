#include "jsb/serializer.hpp"

using namespace jsb;

void serializer::write_bytes(const std::vector<std::uint8_t>& value) {
  write<std::uint32_t>(value.size());
  for(const auto& c : value) {
    buffer.push_back(c);
  }
}

void serializer::write_string(const std::string& value) {
  write<std::uint32_t>(value.size());
  for(const auto& c : value) {
    buffer.push_back(c);
  }
}

void serializer::rewind() {
  buffer.clear();
}
