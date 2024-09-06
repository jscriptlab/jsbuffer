#ifndef JSB_DESERIALIZER_H
#define JSB_DESERIALIZER_H

#include <jsb/jsb.h>

struct jsb_deserializer_t {
  jsb_uint8_t* buffer;
  jsb_uint32_t size;
  // Current offset in the buffer
  jsb_uint32_t offset;
};

enum jsb_result_t jsb_deserializer_init(struct jsb_deserializer_t*, jsb_uint8_t* buffer, jsb_uint32_t size);

/**
 * Go back a few bytes in the deserializer buffer.
 */
enum jsb_result_t jsb_deserializer_rewind(struct jsb_deserializer_t*, jsb_uint32_t position);

enum jsb_result_t jsb_deserializer_read_int64(struct jsb_deserializer_t*, jsb_int64_t*);
enum jsb_result_t jsb_deserializer_read_uint64(struct jsb_deserializer_t*, jsb_uint64_t*);
enum jsb_result_t jsb_deserializer_read_int32(struct jsb_deserializer_t*, jsb_int32_t*);
enum jsb_result_t jsb_deserializer_read_uint32(struct jsb_deserializer_t*, jsb_uint32_t*);
enum jsb_result_t jsb_deserializer_read_uint16(struct jsb_deserializer_t*, jsb_uint16_t*);
enum jsb_result_t jsb_deserializer_read_int16(struct jsb_deserializer_t*, jsb_int16_t*);
enum jsb_result_t jsb_deserializer_read_uint8(struct jsb_deserializer_t*, jsb_uint8_t*);
enum jsb_result_t jsb_deserializer_read_int8(struct jsb_deserializer_t*, jsb_int8_t*);
enum jsb_result_t jsb_deserializer_read_double(struct jsb_deserializer_t*, jsb_double_t*);
enum jsb_result_t jsb_deserializer_read_float(struct jsb_deserializer_t*, jsb_float_t*);

/**
 * Read a buffer from the deserializer buffer into `out_buffer`
 * @param deserializer Deserializer instance
 * @param size Amount of bytes to read from the deserializer buffer
 * @param out_buffer Buffer to copy the slice of the deserializer buffer to
 * @return JSB_OK if the buffer was read successfully, JSB_OUT_OF_BOUNDS_ERROR if the deserializer buffer does not have the necessary amount of bytes to read
 */
enum jsb_result_t jsb_deserializer_read_buffer(struct jsb_deserializer_t* deserializer, jsb_uint32_t size, jsb_uint8_t* out_buffer) ;

#endif // JSB_DESERIALIZER_H
