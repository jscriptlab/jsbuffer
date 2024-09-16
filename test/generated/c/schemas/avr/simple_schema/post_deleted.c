#include "simple_schema/post_deleted.h"

enum jsb_result_t
simple_schema_post_deleted_decode(struct jsb_deserializer_t* d,
                                  struct simple_schema_post_deleted_t* result) {
  {
    JSB_TRACE("simple_schema_post_deleted_decode",
              "Decoding simple_schema.PostDeleted...");
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != 1154524640) {
      JSB_TRACE("simple_schema_post_deleted_decode",
                "Invalid CRC header for simple_schema.PostDeleted. Expected "
                "1154524640, but got %d instead.",
                header);
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_TRACE("simple_schema_post_deleted_decode", "Decoding id...");
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->id));
  JSB_TRACE("simple_schema_post_deleted_decode", "Decoding authorId...");
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->authorId));
  JSB_TRACE("simple_schema_post_deleted_decode", "Decoding title...");
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

enum jsb_result_t simple_schema_post_deleted_encode(
    const struct simple_schema_post_deleted_t* input,
    struct jsb_serializer_t* s) {
  JSB_TRACE("simple_schema_post_deleted_encode",
            "Encoding simple_schema.PostDeleted...");
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 1154524640));
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
simple_schema_post_deleted_init(struct simple_schema_post_deleted_t* value) {
  if (value == NULL) {
    JSB_TRACE("simple_schema_post_deleted_init",
              "Failed to initialize simple_schema.PostDeleted, received value "
              "= NULL.");
    return JSB_BAD_ARGUMENT;
  }
  JSB_TRACE("simple_schema_post_deleted_init", "Initializing param id...");
  value->id = 0;
  JSB_TRACE("simple_schema_post_deleted_init", "Initialized param id.");
  JSB_TRACE("simple_schema_post_deleted_init",
            "Initializing param authorId...");
  value->authorId = 0;
  JSB_TRACE("simple_schema_post_deleted_init", "Initialized param authorId.");
  JSB_TRACE("simple_schema_post_deleted_init", "Initializing param title...");
#ifdef JSB_SCHEMA_MALLOC
  jsb_memset(value->title, 0, jsb_strlen(value->title));
#else
  jsb_memset(&value->title, 0, JSB_MAX_STRING_SIZE);
  value->title[JSB_MAX_STRING_SIZE] = 0;
#endif // JSB_SCHEMA_MALLOC
  JSB_TRACE("simple_schema_post_deleted_init", "Initialized param title.");
  return JSB_OK;
}

void simple_schema_post_deleted_free(struct simple_schema_post_deleted_t* s) {
  if (s == NULL)
    return;
  (void)s;
}
