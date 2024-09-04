#ifndef JSBUFFER_SERIALIZER_H
#define JSBUFFER_SERIALIZER_H

#include <jsb/jsb.h>

struct jsb_serializer_t {
#ifdef JSB_SERIALIZER_USE_MALLOC
    jsb_bytes_t buffer;
#else
#ifndef JSB_SERIALIZER_BUFFER_SIZE
#define JSB_SERIALIZER_BUFFER_SIZE 1024
#endif
    jsb_byte_t buffer[JSB_SERIALIZER_BUFFER_SIZE];
#endif
    jsb_uint32_t buffer_size;
    jsb_uint32_t buffer_capacity;
};

enum jsb_result_t jsb_serializer_init(struct jsb_serializer_t*, jsb_uint32_t max_size);
enum jsb_result_t jsb_serializer_rewind(struct jsb_serializer_t*);
enum jsb_result_t jsb_serializer_write_int64(struct jsb_serializer_t*, jsb_int64_t);
enum jsb_result_t jsb_serializer_write_uint64(struct jsb_serializer_t*, jsb_uint64_t);
enum jsb_result_t jsb_serializer_write_int32(struct jsb_serializer_t*, jsb_int32_t);
enum jsb_result_t jsb_serializer_write_uint32(struct jsb_serializer_t*, jsb_uint32_t);
enum jsb_result_t jsb_serializer_write_uint16(struct jsb_serializer_t*, jsb_uint16_t);
enum jsb_result_t jsb_serializer_write_int16(struct jsb_serializer_t*, jsb_int16_t);
enum jsb_result_t jsb_serializer_write_uint8(struct jsb_serializer_t*, jsb_uint8_t);
enum jsb_result_t jsb_serializer_write_int8(struct jsb_serializer_t*, jsb_int8_t);
enum jsb_result_t jsb_serializer_write_buffer(struct jsb_serializer_t* s, const jsb_uint8_t* buffer, jsb_uint32_t size);
void jsb_serializer_free(struct jsb_serializer_t* s);

#endif // JSBUFFER_SERIALIZER_H
