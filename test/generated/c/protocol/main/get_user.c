#include "protocol/main/get_user.h"

enum jsb_result_t
protocol_main_get_user_decode(struct jsb_deserializer_t* d,
                              struct protocol_main_get_user_t* result) {
  {
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != -1150313593) {
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->id));
  return JSB_OK;
}

enum jsb_result_t
protocol_main_get_user_encode(const struct protocol_main_get_user_t* input,
                              struct jsb_serializer_t* s) {
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, -1150313593));
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->id));
  return JSB_OK;
}

enum jsb_result_t
protocol_main_get_user_init(struct protocol_main_get_user_t* value) {
  if (value == NULL)
    return JSB_BAD_ARGUMENT;
  value->id = 0;
  return JSB_OK;
}

void protocol_main_get_user_free(struct protocol_main_get_user_t* s) {
  if (s == NULL)
    return;
  (void)s;
}
