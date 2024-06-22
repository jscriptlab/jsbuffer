#ifndef JSBUFFER_SERIALIZER_H
#define JSBUFFER_SERIALIZER_H

#include "jsb.h"

#define JSB_SERIALIZE_WR

struct jsb_serializer_t {
    unsigned char* buffer;
    unsigned int buffer_size;
    unsigned int buffer_capacity;
};

enum jsb_result_t jsb_serializer_init(struct jsb_serializer_t*, jsb_uint8_t* buf, jsb_uint32_t max_size);

enum jsb_result_t jsb_serializer_write_int64(struct jsb_serializer_t*, jsb_int64_t);
enum jsb_result_t jsb_serializer_write_uint64(struct jsb_serializer_t*, jsb_uint64_t);
enum jsb_result_t jsb_serializer_write_int32(struct jsb_serializer_t*, jsb_int32_t);
enum jsb_result_t jsb_serializer_write_uint32(struct jsb_serializer_t*, jsb_uint32_t);
enum jsb_result_t jsb_serializer_write_uint16(struct jsb_serializer_t*, jsb_uint16_t);
enum jsb_result_t jsb_serializer_write_int16(struct jsb_serializer_t*, jsb_int16_t);
enum jsb_result_t jsb_serializer_write_uint8(struct jsb_serializer_t*, jsb_uint8_t);
enum jsb_result_t jsb_serializer_write_int8(struct jsb_serializer_t*, jsb_int8_t);
enum jsb_result_t jsb_serializer_write_string(struct jsb_serializer_t*, jsb_string_t);

#endif // JSBUFFER_SERIALIZER_H
