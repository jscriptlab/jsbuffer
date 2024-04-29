#ifndef JSBUFFER_CPP_SERIALIZER_H_
#define JSBUFFER_CPP_SERIALIZER_H_

#include <vector>
#include <cstdint>
#include <string>

namespace jsb {

class serializer {
public:
  serializer() = default;
  serializer(const serializer&) = delete;
  serializer& operator=(const serializer&) = delete;

  void rewind();

  template <typename T, typename = std::enable_if<std::is_integral<T>::value>>
  void write(const T& value) {
    for(std::size_t i = 0; i < sizeof(T); ++i) {
      /**
       * Little-endian
       */
#if __BYTE_ORDER__ == __ORDER_LITTLE_ENDIAN__
      buffer.push_back((value >> (i * 8)) & 0xFF);
#else
      buffer.push_back((value >> ((sizeof(T) - i - 1) * 8)) & 0xFF);
#endif
    }
  }

  void write_string(const std::string& value);

  void write_bytes(const std::vector<std::uint8_t>& value);

  const std::vector<std::uint8_t>& get_buffer() const {
    return buffer;
  }
private:
  std::vector<std::uint8_t> buffer;
};

} // namespace jsb

#endif // JSBUFFER_CPP_SERIALIZER_H_
