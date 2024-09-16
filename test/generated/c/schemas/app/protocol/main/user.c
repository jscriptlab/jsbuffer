#include "protocol/main/user.h"

enum jsb_result_t
protocol_main_user_decode(struct jsb_deserializer_t* d,
                          struct protocol_main_user_t* result) {
  {
    JSB_TRACE("protocol_main_user_decode", "Decoding protocol.main.User...");
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != 1081421617) {
      JSB_TRACE("protocol_main_user_decode",
                "Invalid CRC header for protocol.main.User. Expected "
                "1081421617, but got %d instead.",
                header);
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_TRACE("protocol_main_user_decode", "Decoding id...");
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->id));
  JSB_TRACE("protocol_main_user_decode", "Decoding name...");
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
    JSB_CHECK_ERROR(jsb_deserializer_read_buffer(d, len, result->name));
    result->name[len] = '\0';
  }
  return JSB_OK;
}

enum jsb_result_t
protocol_main_user_encode(const struct protocol_main_user_t* input,
                          struct jsb_serializer_t* s) {
  JSB_TRACE("protocol_main_user_encode", "Encoding protocol.main.User...");
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 1081421617));
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->id));
  {
    // Length of the buffer
    const jsb_uint32_t len = jsb_strlen(input->name);
    JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, len));
    JSB_CHECK_ERROR(jsb_serializer_write_buffer(s, input->name, len));
  }
  return JSB_OK;
}

enum jsb_result_t protocol_main_user_init(struct protocol_main_user_t* value) {
  if (value == NULL) {
    JSB_TRACE(
        "protocol_main_user_init",
        "Failed to initialize protocol.main.User, received value = NULL.");
    return JSB_BAD_ARGUMENT;
  }
  JSB_TRACE("protocol_main_user_init",
            "Initializing param of type \"jsb_int32_t\": id.");
  /**
   * jsb_int32_t
   */
  value->id = 0;
  JSB_TRACE("protocol_main_user_init", "Initialized param: id.");

  JSB_TRACE("protocol_main_user_init",
            "Initializing param of type \"jsb_string_t\": name.");
  /**
   * jsb_string_t
   */
#ifdef JSB_SCHEMA_MALLOC
  /**
   * Here we should have something similar the following options:
   *
   * 1. Have additional value->name_len and value->name_capacity members
   * in order to control the maximum capacity of the memory block and be able to
   * fully set it to zero.
   *
   * 2. We could simply stick to the null-terminated string in order to keep it
   * simple.
   *
   * 3. Whenever JSB_SCHEMA_MALLOC is defined, we could implement both of the
   * behaviors above, if feasible.
   */
#error "JSB_SCHEMA_MALLOC is not implemented yet"
#else
  jsb_memset(&value->name, 0, sizeof(jsb_string_t));
#endif // JSB_SCHEMA_MALLOC
  JSB_TRACE("protocol_main_user_init", "Initialized param: name.");

  return JSB_OK;
}

void protocol_main_user_free(struct protocol_main_user_t* s) {
  if (s == NULL)
    return;
  (void)s;
}
