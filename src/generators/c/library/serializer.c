#include "codec.h"
#include "jsb/ieee754.h"

#include <jsb/serializer.h>

#ifdef JSB_SERIALIZER_USE_MALLOC
#include <stdlib.h>
#endif

#define JSB_INCREMENT_BUFFER_SIZE(CONTEXT, s, COUNT)                           \
  s->buffer_size += COUNT;                                                     \
  JSB_TRACE(CONTEXT, "Changed buffer size to: %d", s->buffer_size)

enum jsb_result_t jsb_serializer_init(struct jsb_serializer_t* self,
                                      jsb_uint32_t max_size) {
  if (self == NULL) {
    return JSB_BAD_ARGUMENT;
  }
  if (max_size == 0) {
    JSB_TRACE("jsb_serializer_init",
              "FATAL: max_size must be above zero. Received: %d", max_size);
    return JSB_BAD_ARGUMENT;
  }
#ifdef JSB_SERIALIZER_USE_MALLOC
  // Free any existing memory before allocating more, in ordet to avoid a memory leak
  self->buffer          = (jsb_uint8_t*)malloc(sizeof(jsb_uint8_t) * max_size);
  self->buffer_capacity = max_size;
#elif defined(JSB_SERIALIZER_BUFFER_SIZE)
  if (!(JSB_SERIALIZER_BUFFER_SIZE)) {
    JSB_TRACE("jsb_serializer_init",
              "FATAL: JSB_SERIALIZER_BUFFER_SIZE must be defined. Received: %d",
              JSB_SERIALIZER_BUFFER_SIZE);
    return JSB_BAD_ARGUMENT;
  }
  // If `max_size` is higher than `JSB_SERIALIZER_BUFFER_SIZE`, return an error
  if (max_size > JSB_SERIALIZER_BUFFER_SIZE) {
    return JSB_BUFFER_OVERFLOW;
  }
  self->buffer_capacity = JSB_SERIALIZER_BUFFER_SIZE;
#else
#error                                                                         \
    "Either JSB_SERIALIZER_BUFFER_SIZE or JSB_SERIALIZER_USE_MALLOC should be defined"
#endif
  self->buffer_size = 0;
  return JSB_OK;
}

enum jsb_result_t jsb_serializer_rewind(struct jsb_serializer_t* s) {
  if (s == NULL) {
    JSB_TRACE("jsb_serializer_rewind",
              "Received NULL for the serializer argument");
    return JSB_BAD_ARGUMENT;
  }
  s->buffer_size = 0;
  return JSB_OK;
}

// Make sure to reallocate the buffer or that the serializer buffer is big
// enough to write `required_size` bytes
static enum jsb_result_t jsb_serializer_reallocate(struct jsb_serializer_t* s,
                                                   jsb_uint32_t required_size) {
  JSB_ASSERT_ARGUMENT(s != NULL, "jsb_serializer_reallocate",
                      "Serializer is NULL");

#ifdef JSB_SERIALIZER_USE_MALLOC
  JSB_ASSERT_ARGUMENT(s->buffer != NULL, "jsb_serializer_reallocate",
                      "Buffer is NULL");
#endif

  const jsb_uint32_t remaining = JSB_SERIALIZER_CALCULATE_REMAINING(s);

  JSB_ASSERT_ARGUMENT(
      remaining <= s->buffer_capacity, "jsb_serializer_reallocate",
      "Possibly memory corruption: "
      "Remaining buffer size is higher than the buffer capacity");

  JSB_TRACE("jsb_serializer_reallocate", "Remaining: %d, Required: %d",
            remaining, required_size);
  if (remaining > s->buffer_capacity) {
    JSB_TRACE(
        "jsb_serializer_reallocate",
        "FATAL: Remaining buffer size is higher than the buffer capacity");
    return JSB_BUFFER_OVERFLOW;
  }
  if (remaining < required_size) {
#ifdef JSB_SERIALIZER_USE_MALLOC
    jsb_uint32_t new_buffer_capacity = (s->buffer_capacity * 2) + required_size;
    JSB_TRACE("jsb_serializer_reallocate",
              "Reallocating buffer from %d to %d bytes", s->buffer_capacity,
              new_buffer_capacity);
    jsb_uint8_t* new_buffer = (jsb_uint8_t*)realloc(
        s->buffer, sizeof(jsb_uint8_t) * new_buffer_capacity);
    if (new_buffer == NULL) {
      JSB_TRACE("jsb_serializer_reallocate",
                "Failed to reallocate buffer, call to `realloc` returned NULL");
      return JSB_MEMORY_ALLOCATION_ERROR;
    }
    s->buffer          = new_buffer;
    s->buffer_capacity = new_buffer_capacity;
#else
    return JSB_BUFFER_OVERFLOW;
#endif
  }
  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_int64(struct jsb_serializer_t* s,
                                             jsb_int64_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 8));

  JSB_CHECK_ERROR(jsb_encode_int64(&s->buffer[s->buffer_size], value));

  s->buffer_size += 8;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_uint64(struct jsb_serializer_t* s,
                                              jsb_uint64_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 8));

  JSB_CHECK_ERROR(jsb_encode_uint64(&s->buffer[s->buffer_size], value));

  s->buffer_size += 8;

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_int32(struct jsb_serializer_t* s,
                                             jsb_int32_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 4));

  JSB_CHECK_ERROR(jsb_encode_int32(&s->buffer[s->buffer_size], value));

  JSB_INCREMENT_BUFFER_SIZE("jsb_serializer_write_int32", s, 4);

  JSB_TRACE("jsb_serializer_write_int32", "%d", value);

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_uint32(struct jsb_serializer_t* s,
                                              jsb_uint32_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 4));

  JSB_CHECK_ERROR(jsb_encode_uint32(&s->buffer[s->buffer_size], value));

  JSB_INCREMENT_BUFFER_SIZE("jsb_serializer_write_uint32", s, 4);

  JSB_TRACE("jsb_serializer_write_uint32", "%d", value);

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_uint16(struct jsb_serializer_t* s,
                                              jsb_uint16_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 2));

  JSB_CHECK_ERROR(jsb_encode_uint16(&s->buffer[s->buffer_size], value));

  JSB_INCREMENT_BUFFER_SIZE("jsb_serializer_write_uint16", s, 2);

  JSB_TRACE("jsb_serializer_write_uint16", "%d", value);

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_int16(struct jsb_serializer_t* s,
                                             jsb_int16_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 2));

  JSB_CHECK_ERROR(jsb_encode_uint16(&s->buffer[s->buffer_size], value));

  JSB_INCREMENT_BUFFER_SIZE("jsb_serializer_write_int16", s, 2);

  JSB_TRACE("jsb_serializer_write_int16", "%d", value);

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_uint8(struct jsb_serializer_t* s,
                                             const jsb_uint8_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 1));

  s->buffer[s->buffer_size] = (jsb_uint8_t)value;

  JSB_INCREMENT_BUFFER_SIZE("jsb_serializer_write_uint8", s, 1);

  JSB_TRACE("jsb_serializer_write_uint8", "write: %d", value);

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_int8(struct jsb_serializer_t* s,
                                            const jsb_int8_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 1));

  s->buffer[s->buffer_size] = (jsb_uint8_t)value;

  JSB_INCREMENT_BUFFER_SIZE("jsb_serializer_write_int8", s, 1);

  JSB_TRACE("jsb_serializer_write_int16", "write: %d", value);

  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_float(struct jsb_serializer_t* s,
                                             const jsb_float_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 4));
  JSB_CHECK_ERROR(jsb_encode_float(&s->buffer[s->buffer_size], value));

  JSB_INCREMENT_BUFFER_SIZE("jsb_serializer_write_float", s, 4);

  JSB_TRACE("jsb_serializer_write_float", "write: %f", value);
  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_double(struct jsb_serializer_t* s,
                                              jsb_double_t value) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, 8));
  JSB_CHECK_ERROR(jsb_encode_double(&s->buffer[s->buffer_size], value));
  JSB_INCREMENT_BUFFER_SIZE("jsb_serializer_write_double", s, 8);
  JSB_TRACE("jsb_serializer_write_double", "write: %f", value);
  return JSB_OK;
}

enum jsb_result_t jsb_serializer_write_buffer(struct jsb_serializer_t* s,
                                              const jsb_uint8_t* buffer,
                                              jsb_uint32_t size) {
  JSB_CHECK_ERROR(jsb_serializer_reallocate(s, size));

  jsb_memcpy(&s->buffer[s->buffer_size], buffer, size);

  JSB_TRACE("jsb_serializer_write_buffer", "write: %d bytes", size);

  JSB_INCREMENT_BUFFER_SIZE("jsb_serializer_write_buffer", s, size);

  return JSB_OK;
}

void jsb_serializer_free(struct jsb_serializer_t* s) {
  if (s == NULL) {
    JSB_TRACE("jsb_serializer_free",
              "Received NULL for the serializer argument");
    return;
  }
#ifdef JSB_SERIALIZER_USE_MALLOC
  if (s->buffer == NULL)
    return;
  JSB_TRACE("jsb_serializer_free", "Freeing buffer");
  jsb_free(s->buffer);
#endif
}
