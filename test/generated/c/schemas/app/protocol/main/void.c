#include "protocol/main/void.h"

enum jsb_result_t
protocol_main_void_decode(struct jsb_deserializer_t* d,
                          struct protocol_main_void_t* result) {
  {
    JSB_TRACE("protocol_main_void_decode", "Decoding protocol.main.Void...");
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != 357013552) {
      JSB_TRACE("protocol_main_void_decode",
                "Invalid CRC header for protocol.main.Void. Expected "
                "357013552, but got %d instead.",
                header);
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_TRACE("protocol_main_void_decode", "Decoding value...");
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->value));
  return JSB_OK;
}

enum jsb_result_t
protocol_main_void_encode(const struct protocol_main_void_t* input,
                          struct jsb_serializer_t* s) {
  JSB_TRACE("protocol_main_void_encode", "Encoding protocol.main.Void...");
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 357013552));
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->value));
  return JSB_OK;
}

enum jsb_result_t protocol_main_void_init(struct protocol_main_void_t* value) {
  if (value == NULL) {
    JSB_TRACE(
        "protocol_main_void_init",
        "Failed to initialize protocol.main.Void, received value = NULL.");
    return JSB_BAD_ARGUMENT;
  }
  JSB_TRACE("protocol_main_void_init",
            "Initializing param of type \"jsb_int32_t\": value.");
  /**
   * jsb_int32_t
   */
  value->value = 0;
  JSB_TRACE("protocol_main_void_init", "Initialized param: value.");

  return JSB_OK;
}

void protocol_main_void_free(struct protocol_main_void_t* s) {
  if (s == NULL)
    return;
  (void)s;
}
