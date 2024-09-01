#include "codec.h"
#include <jsb/serializer.h>

enum jsb_result_t jsb_serializer_init(struct jsb_serializer_t* self, jsb_uint32_t max_size) {
#ifdef JSB_SERIALIZER_USE_MALLOC
  self->buffer = (jsb_uint8_t*) malloc(sizeof(jsb_uint8_t) * max_size);
  self->buffer_capacity = max_size;
#else
  // If `max_size` is higher than `JSB_SERIALIZER_BUFFER_SIZE`, return an error
  if(max_size > JSB_SERIALIZER_BUFFER_SIZE) {
    return JSB_BUFFER_OVERFLOW;
  }
  self->buffer_capacity = JSB_SERIALIZER_BUFFER_SIZE;
#endif
  self->buffer_size = 0;
  return JSB_OK;
}

// Make sure to reallocate the buffer or that the serializer buffer is big enough to write `required_size` bytes
static enum jsb_result_t jsb_serializer_reallocate(struct jsb_serializer_t* s, jsb_uint32_t required_size) {
  const jsb_uint32_t remaining = s->buffer_capacity - s->buffer_size;
  if(remaining < required_size) {
#ifdef JSB_SERIALIZER_USE_MALLOC
    jsb_uint8_t* new_buffer = (jsb_uint8_t*) realloc(s->buffer, sizeof(jsb_uint8_t) * required_size);
    if(new_buffer == NULL) {
      return JSB_MEMORY_ALLOCATION_ERROR;
    }
    s->buffer = new_buffer;
    s->buffer_capacity = required_size;
#else
    return JSB_BUFFER_OVERFLOW;
#endif
  }
  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_int64(struct jsb_serializer_t* s, jsb_int64_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 8));

  JSB_CHECK_ERROR(jsb_encode_int64(&s->buffer[s->buffer_size], value));

  s->buffer_size += 8;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_uint64(struct jsb_serializer_t* s, jsb_uint64_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 8));

  JSB_CHECK_ERROR(jsb_encode_uint64(&s->buffer[s->buffer_size], value));

  s->buffer_size += 8;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_int32(struct jsb_serializer_t* s, jsb_int32_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 4));

  JSB_CHECK_ERROR(jsb_encode_int32(&s->buffer[s->buffer_size], value));

  s->buffer_size += 4;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_uint32(struct jsb_serializer_t* s, jsb_uint32_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 4));

  JSB_CHECK_ERROR(jsb_encode_uint32(&s->buffer[s->buffer_size], value));

  s->buffer_size += 4;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_uint16(struct jsb_serializer_t* s, jsb_uint16_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 2));

  JSB_CHECK_ERROR(jsb_encode_uint16(&s->buffer[s->buffer_size], value));

  s->buffer_size += 2;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_int16(struct jsb_serializer_t* s, jsb_int16_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 2));

  JSB_CHECK_ERROR(jsb_encode_uint16(&s->buffer[s->buffer_size], value));

  s->buffer_size += 2;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_uint8(struct jsb_serializer_t* s, const jsb_uint8_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 1));

  s->buffer[s->buffer_size++] = (jsb_uint8_t) value;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_int8(struct jsb_serializer_t* s, const jsb_int8_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 1));

  s->buffer[s->buffer_size++] = (jsb_uint8_t) value;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_buffer(struct jsb_serializer_t* s, const jsb_uint8_t* buffer, jsb_uint32_t size) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, size));

#ifdef JSB_SERIALIZER_USE_MALLOC
  memcpy(&s->buffer[s->buffer_size], buffer, size);
#else
  for(jsb_uint32_t i = 0; i < size; i++) {
    s->buffer[s->buffer_size++] = buffer[i];
  }
#endif

  return JSB_OK;
}

