#include <jsb/deserializer.h>

#include "codec.h"

#include <string.h>

enum jsb_result_t jsb_deserializer_init(struct jsb_deserializer_t* d, jsb_uint8_t* buffer, jsb_uint32_t size) {
  d->buffer = buffer;
  d->offset = 0;
  d->size = size;
  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_assert_remaining_bytes(const struct jsb_deserializer_t* d, jsb_uint32_t expected_byte_count) {
  if(d->offset + expected_byte_count > d->size) {
    return JSB_OUT_OF_BOUNDS;
  }

  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_rewind(struct jsb_deserializer_t* d, jsb_uint32_t position) {
  if(position > d->offset) {
    return JSB_OUT_OF_BOUNDS;
  }

  d->offset -= position;
  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_read_int64(struct jsb_deserializer_t* d, jsb_int64_t* out) {
  JSB_CHECK_ERROR(jsb_deserializer_assert_remaining_bytes(d, 8));
  JSB_CHECK_ERROR(jsb_decode_int64(d->buffer + d->offset, out));
  d->offset += 8;
  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_read_uint64(struct jsb_deserializer_t* d, jsb_uint64_t* out) {
  JSB_CHECK_ERROR(jsb_deserializer_assert_remaining_bytes(d, 8));
  JSB_CHECK_ERROR(jsb_decode_uint64(d->buffer + d->offset, out));
  d->offset += 8;
  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_read_int32(struct jsb_deserializer_t* d, jsb_int32_t* out) {
  JSB_CHECK_ERROR(jsb_deserializer_assert_remaining_bytes(d, 4));
  JSB_CHECK_ERROR(jsb_decode_int32(d->buffer + d->offset, out));
  d->offset += 4;
  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_read_uint32(struct jsb_deserializer_t* d, jsb_uint32_t* out) {
  JSB_CHECK_ERROR(jsb_deserializer_assert_remaining_bytes(d, 4));
  JSB_CHECK_ERROR(jsb_decode_uint32(d->buffer + d->offset, out));
  d->offset += 4;
  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_read_uint16(struct jsb_deserializer_t* d, jsb_uint16_t* out) {
  JSB_CHECK_ERROR(jsb_deserializer_assert_remaining_bytes(d, 2));
  JSB_CHECK_ERROR(jsb_decode_uint16(d->buffer + d->offset, out));
  d->offset += 2;
  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_read_int16(struct jsb_deserializer_t* d, jsb_int16_t* out) {
  JSB_CHECK_ERROR(jsb_deserializer_assert_remaining_bytes(d, 2));
  JSB_CHECK_ERROR(jsb_decode_int16(d->buffer + d->offset, out));
  d->offset += 2;
  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_read_uint8(struct jsb_deserializer_t* d, jsb_uint8_t* out) {
  JSB_CHECK_ERROR(jsb_deserializer_assert_remaining_bytes(d, 1));
  JSB_CHECK_ERROR(jsb_decode_uint8(d->buffer + d->offset, out));
  d->offset += 1;
  return JSB_OK;
}

enum jsb_result_t jsb_deserializer_read_int8(struct jsb_deserializer_t* d, jsb_int8_t* out) {
  JSB_CHECK_ERROR(jsb_deserializer_assert_remaining_bytes(d, 1));
  JSB_CHECK_ERROR(jsb_decode_int8(d->buffer + d->offset, out));
  d->offset += 1;
  return JSB_OK;
}

/**
 * Read a buffer from the deserializer buffer, and pass a reference to it
 * @param size Amount of bytes to read from the deserializer buffer
 * @param out_buffer_ptr Pointer to pass a reference to the deserializer buffer to
 * @return JSB_OK if the buffer was read successfully, JSB_OUT_OF_BOUNDS_ERROR if the deserializer buffer does not have the necessary amount of bytes to read
 */
enum jsb_result_t jsb_deserializer_read_buffer(struct jsb_deserializer_t* deserializer, jsb_uint32_t size, jsb_uint8_t* out_buffer_ptr) {
  JSB_CHECK_ERROR(jsb_deserializer_assert_remaining_bytes(deserializer, size));

  // The size of the buffer is limited to JSB_MAX_STRING_SIZE
  if(size > JSB_MAX_STRING_SIZE) {
    return JSB_BUFFER_OVERFLOW;
  }

  memcpy(out_buffer_ptr, &deserializer->buffer[deserializer->offset], size * sizeof(jsb_uint8_t));
  deserializer->offset += size;

  return JSB_OK;
}
