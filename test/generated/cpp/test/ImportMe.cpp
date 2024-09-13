#include "test/ImportMe.hpp"

#include <stdexcept>

test::ImportMe test::ImportMe::decode(jsb::deserializer& d) {
  {
    const auto header = d.read<std::int32_t>();
    if (header != -1180620582) {
      throw std::runtime_error(
          "Invalid CRC header: Expected -1180620582, but got " + header +
          " instead");
    }
  }
  test::ImportMe result;
  result.value = d.read<std::int32_t>();
  {
    const auto len = d.read<std::uint32_t>();
    result.buffer  = d.read_bytes(len);
  }
  return result;
}

void test::ImportMe::encode(jsb::serializer& s) const {
  s.write<std::int32_t>(-1180620582);
  s.write(value);
  s.write_bytes(buffer);
}
