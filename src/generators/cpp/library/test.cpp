#include "jsb/deserializer.hpp"
#include "jsb/serializer.hpp"

#include "test_schema/Message.hpp"

#include <iostream>
#include <limits>
#include <stdexcept>

namespace jsb {
inline void assert(bool expr);
}

void jsb::assert(bool expr) {
  if (!expr) {
    throw std::runtime_error("Assertion failed");
  }
}

static bool compareMessages(const test_schema::Message& a,
                            const test_schema::Message& b) {
  if (a.id != b.id) {
    return false;
  }
  for (size_t i = 0; i < a.event.size(); i++) {
    if (a.event[i].seconds != b.event[i].seconds) {
      return false;
    }
    if (a.event[i].nanoseconds != b.event[i].nanoseconds) {
      return false;
    }
    if (a.event[i].bit != b.event[i].bit) {
      return false;
    }
  }
  return true;
}

int main() {
  jsb::serializer s;
  s.write<std::int32_t>(1510581918);
  s.write<std::uint8_t>(240);
  s.write<std::int8_t>(100);
  s.write<std::uint32_t>(100);
  s.write<std::uint32_t>(std::numeric_limits<std::uint32_t>::max());
  s.write_string("Hello, World!");

  jsb::deserializer d(s.get_buffer());
  jsb::assert(d.read<std::int32_t>() == 1510581918);
  jsb::assert(d.read<std::uint8_t>() == 240);
  jsb::assert(d.read<std::int8_t>() == 100);
  jsb::assert(d.read<std::uint32_t>() == 100);
  jsb::assert(d.read<std::uint32_t>() ==
              std::numeric_limits<std::uint32_t>::max());
  jsb::assert(d.read_string() == "Hello, World!");

  // Throw if we try to read more than the buffer has
  try {
    d.read<std::uint8_t>();
    jsb::assert(false);
  } catch (const std::runtime_error& e) {
    jsb::assert(true);
  }

  test_schema::Message msg = {
    100000LU,
    {
      {100, 100, 100},
      {200, 200, 200}
    }
  };
  msg.encode(s);
  test_schema::Message decoded = test_schema::Message::decode(d);
  jsb::assert(msg.id == decoded.id);
  jsb::assert(compareMessages(msg, decoded));

  std::cout << "Ok" << std::endl;

  return 0;
}
