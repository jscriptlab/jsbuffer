#include "jsb/deserializer.hpp"
#include "jsb/serializer.hpp"

#include "index/Message.hpp"

#include <cassert>
#include <limits>
#include <stdexcept>

static bool compareMessages(const index::Message& a, const index::Message& b) {
  if (a.id != b.id) {
    return false;
  }
  for(size_t i = 0; i < a.event.size(); i++) {
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
  s.write<std::uint8_t>(240);
  s.write<std::int8_t>(100);
  s.write<std::uint32_t>(100);
  s.write<std::uint32_t>(std::numeric_limits<std::uint32_t>::max());
  s.write_string("Hello, World!");

  jsb::deserializer d(s.get_buffer());
  assert(d.read<std::uint8_t>() == 240);
  assert(d.read<std::int8_t>() == 100);
  assert(d.read<std::uint32_t>() == 100);
  assert(d.read<std::uint32_t>() == std::numeric_limits<std::uint32_t>::max());
  assert(d.read_string() == "Hello, World!");

  // Throw if we try to read more than the buffer has
  try {
    d.read<std::uint8_t>();
    assert(false);
  } catch(const std::runtime_error& e) {
    assert(true);
  }

  index::Message msg = {
    .id = 100000LU,
    .event = {
      {
        .seconds = 100,
        .nanoseconds = 100,
        .bit = 100
      },
      {
        .seconds = 200,
        .nanoseconds = 200,
        .bit = 200
      }
    }
  };
  msg.encode(s);
  index::Message decoded = index::Message::decode(d);
  assert(msg.id == decoded.id);
  assert(compareMessages(msg, decoded));

  return 0;
}
