#include "app/command_move_backwards.h"

enum jsb_result_t
app_command_move_backwards_decode(struct jsb_deserializer_t* d,
                                  struct app_command_move_backwards_t* result) {
  {
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != 985001043) {
      return JSB_INVALID_CRC_HEADER;
    }
  }
  {
    jsb_uint8_t value;
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &value));
    if (value != 1 && value != 0)
      return JSB_INVALID_DECODED_VALUE;
    result->stop = value == 1 ? true : false;
  }
  {
    jsb_uint32_t len;
    JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &len));
    if (len > JSB_MAX_STRING_SIZE)
      return JSB_BUFFER_OVERFLOW;
    JSB_CHECK_ERROR(jsb_deserializer_read_buffer(d, len, result->value));
  }
  JSB_CHECK_ERROR(jsb_deserializer_read_float(d, &result->value2));
  return JSB_OK;
}

enum jsb_result_t app_command_move_backwards_encode(
    const struct app_command_move_backwards_t* input,
    struct jsb_serializer_t* s) {
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 985001043));
  JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, input->stop ? 1 : 0));
  {
    // Length of the buffer
    const jsb_uint32_t len = jsb_strlen(input->value);
    JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, len));
    JSB_CHECK_ERROR(jsb_serializer_write_buffer(s, input->value, len));
  }
  JSB_CHECK_ERROR(jsb_serializer_write_float(s, input->value2));
  return JSB_OK;
}

enum jsb_result_t
app_command_move_backwards_init(struct app_command_move_backwards_t* value) {
  if (value == NULL)
    return JSB_BAD_ARGUMENT;
  value->stop = false;
  // Initialize string
  value->value[0] = '\0';
  value->value2   = 0.0f;
  return JSB_OK;
}

void app_command_move_backwards_free(struct app_command_move_backwards_t* s) {
  if (s == NULL)
    return;
  (void)s;
}
