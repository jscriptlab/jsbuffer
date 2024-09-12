#include "app/command_move_forward.h"

enum jsb_result_t
app_command_move_forward_decode(struct jsb_deserializer_t* d,
                                struct app_command_move_forward_t* result) {
  {
    JSB_TRACE("app_command_move_forward_decode",
              "Decoding app.CommandMoveForward...");
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != 1407274108) {
      JSB_TRACE("app_command_move_forward_decode",
                "Invalid CRC header for app.CommandMoveForward. Expected "
                "1407274108, but got %d instead.",
                header);
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_TRACE("app_command_move_forward_decode", "Decoding stop...");
  {
    jsb_uint8_t value;
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &value));
    if (value != 1 && value != 0)
      return JSB_INVALID_DECODED_VALUE;
    result->stop = value == 1 ? true : false;
  }
  JSB_TRACE("app_command_move_forward_decode", "Decoding value2...");
  JSB_CHECK_ERROR(jsb_deserializer_read_double(d, &result->value2));
  return JSB_OK;
}

enum jsb_result_t
app_command_move_forward_encode(const struct app_command_move_forward_t* input,
                                struct jsb_serializer_t* s) {
  JSB_TRACE("app_command_move_forward_encode",
            "Encoding app.CommandMoveForward...");
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 1407274108));
  JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, input->stop ? 1 : 0));
  JSB_CHECK_ERROR(jsb_serializer_write_double(s, input->value2));
  return JSB_OK;
}

enum jsb_result_t
app_command_move_forward_init(struct app_command_move_forward_t* value) {
  if (value == NULL) {
    JSB_TRACE(
        "app_command_move_forward_init",
        "Failed to initialize app.CommandMoveForward, received value = NULL.");
    return JSB_BAD_ARGUMENT;
  }
  JSB_TRACE("app_command_move_forward_init", "Initializing param stop...");
  value->stop = false;
  JSB_TRACE("app_command_move_forward_init", "Initialized param stop.");
  JSB_TRACE("app_command_move_forward_init", "Initializing param value2...");
  value->value2 = 0.0;
  JSB_TRACE("app_command_move_forward_init", "Initialized param value2.");
  return JSB_OK;
}

void app_command_move_forward_free(struct app_command_move_forward_t* s) {
  if (s == NULL)
    return;
  (void)s;
}
