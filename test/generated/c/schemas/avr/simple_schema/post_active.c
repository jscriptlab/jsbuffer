#include "simple_schema/post_active.h"

enum jsb_result_t
simple_schema_post_active_decode(struct jsb_deserializer_t* d,
                                 struct simple_schema_post_active_t* result) {
  {
    JSB_TRACE("simple_schema_post_active_decode",
              "Decoding simple_schema.PostActive...");
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != -968397368) {
      JSB_TRACE("simple_schema_post_active_decode",
                "Invalid CRC header for simple_schema.PostActive. Expected "
                "-968397368, but got %d instead.",
                header);
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_TRACE("simple_schema_post_active_decode", "Decoding id...");
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->id));
  JSB_TRACE("simple_schema_post_active_decode", "Decoding authorId...");
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->authorId));
  JSB_TRACE("simple_schema_post_active_decode", "Decoding title...");
  {
    jsb_uint32_t len;
    JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &len));
#ifdef JSB_TOLERATE_TYPE_OVERFLOW
    if (len > JSB_MAX_STRING_SIZE)
      len = JSB_MAX_STRING_SIZE;
#else
    if (len > JSB_MAX_STRING_SIZE)
      return JSB_BUFFER_OVERFLOW;
#endif
    JSB_CHECK_ERROR(jsb_deserializer_read_buffer(d, len, result->title));
    result->title[len] = '\0';
  }
  return JSB_OK;
}

enum jsb_result_t simple_schema_post_active_encode(
    const struct simple_schema_post_active_t* input,
    struct jsb_serializer_t* s) {
  JSB_TRACE("simple_schema_post_active_encode",
            "Encoding simple_schema.PostActive...");
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, -968397368));
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->id));
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->authorId));
  {
    // Length of the buffer
    const jsb_uint32_t len = jsb_strlen(input->title);
    JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, len));
    JSB_CHECK_ERROR(jsb_serializer_write_buffer(s, input->title, len));
  }
  return JSB_OK;
}

enum jsb_result_t
simple_schema_post_active_init(struct simple_schema_post_active_t* value) {
  if (value == NULL) {
    JSB_TRACE("simple_schema_post_active_init",
              "Failed to initialize simple_schema.PostActive, received value = "
              "NULL.");
    return JSB_BAD_ARGUMENT;
  }
  JSB_TRACE("simple_schema_post_active_init", "Initializing param id...");
  value->id = 0;
  JSB_TRACE("simple_schema_post_active_init", "Initialized param id.");
  JSB_TRACE("simple_schema_post_active_init", "Initializing param authorId...");
  value->authorId = 0;
  JSB_TRACE("simple_schema_post_active_init", "Initialized param authorId.");
  JSB_TRACE("simple_schema_post_active_init", "Initializing param title...");
  // Initialize string
  value->title[0] = '\0';
  JSB_TRACE("simple_schema_post_active_init", "Initialized param title.");
  return JSB_OK;
}

void simple_schema_post_active_free(struct simple_schema_post_active_t* s) {
  if (s == NULL)
    return;
  (void)s;
}