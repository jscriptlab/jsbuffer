#ifndef JSB_TEST_IMPORTME_HPP
#define JSB_TEST_IMPORTME_HPP


#include "jsb/serializer.hpp"
#include "jsb/deserializer.hpp"

namespace test {

class ImportMe {
public:
    std::int32_t value;
    std::vector<std::uint8_t> buffer;
    static ImportMe decode(jsb::deserializer&);
    void encode(jsb::serializer&) const;
};

} // test
#endif // JSB_TEST_IMPORTME_HPP
