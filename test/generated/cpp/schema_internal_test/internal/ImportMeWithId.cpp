#include "schema_internal_test/internal/ImportMeWithId.hpp"

#include <stdexcept>

schema_internal_test::internal::ImportMeWithId schema_internal_test::internal::ImportMeWithId::decode(jsb::deserializer& d) {
    {
        const auto header = d.read<std::int32_t>();
        if(header != 1543151611) {
            throw std::runtime_error("Invalid CRC header: Expected 1543151611, but got " + std::to_string(header) + " instead");
        }
    }
    schema_internal_test::internal::ImportMeWithId result;
    result.id = d.read<std::uint32_t>();
    result.data = test::ImportMe::decode(d);
    return result;
}

void schema_internal_test::internal::ImportMeWithId::encode(jsb::serializer& s) const {
    s.write<std::int32_t>(1543151611);
    s.write(id);
    data.encode(s);
}
