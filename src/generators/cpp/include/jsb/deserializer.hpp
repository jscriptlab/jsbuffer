#ifndef JSBUFFER_CPP_DESERIALIZER_H_
#define JSBUFFER_CPP_DESERIALIZER_H_

#include <cstdint>
#include <string>
#include <vector>

namespace jsb {

class deserializer {
public:
  explicit deserializer(const std::vector<std::uint8_t>& buffer);
  deserializer(const deserializer&) = delete;
  deserializer& operator=(const deserializer&) = delete;
  template<typename T, typename = std::enable_if<std::is_integral<T>::value>>
  T read() {
    const auto byte_length = sizeof(T);
    assert_remaining_bytes(byte_length);
    T value = 0;
    for(std::size_t i = 0; i < byte_length; ++i) {
      value |= static_cast<T>(buffer[offset + i]) << (i * 8);
    }
    offset += sizeof(T);
    return value;
  }

  std::string read_string();

  std::vector<std::uint8_t> read_bytes(std::size_t length);
private:
  const std::vector<std::uint8_t>& buffer;
  std::size_t offset = 0;
  /**
   * @brief Asserts that there are enough bytes to read from the buffer.
   * @throws std::runtime_error if there are not enough bytes to read.
   * @param remaining_bytes The number of bytes that are expected to be read.
   */
  void assert_remaining_bytes(std::size_t remaining_bytes) const;
};

} // namespace jsb


#endif //JSBUFFER_CPP_DESERIALIZER_H_
