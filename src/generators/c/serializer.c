#include "serializer.h"
#include "jsb.h"

enum jsb_result_t jsb_serializer_init(struct jsb_serializer_t* self, jsb_uint8_t* buf, jsb_uint32_t max_size) {
    self->buffer = buf;
    self->buffer_size = 0;
    self->buffer_capacity = max_size;
    return JSB_SUCCESS;
}

enum jsb_result_t jsb_serializer_write_int64(struct jsb_serializer_t* s, jsb_int64_t value);

enum jsb_result_t jsb_serializer_write_uint64(struct jsb_serializer_t*, jsb_uint64_t);
enum jsb_result_t jsb_serializer_write_int32(struct jsb_serializer_t*, jsb_int32_t);
enum jsb_result_t jsb_serializer_write_uint32(struct jsb_serializer_t*, jsb_uint32_t);
enum jsb_result_t jsb_serializer_write_uint16(struct jsb_serializer_t*, jsb_uint16_t);
enum jsb_result_t jsb_serializer_write_int16(struct jsb_serializer_t*, jsb_int16_t);
enum jsb_result_t jsb_serializer_write_uint8(struct jsb_serializer_t*, jsb_uint8_t);
enum jsb_result_t jsb_serializer_write_int8(struct jsb_serializer_t*, jsb_int8_t);
enum jsb_result_t jsb_serializer_write_string(struct jsb_serializer_t*, jsb_string_t);

