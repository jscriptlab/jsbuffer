#include "app/message.h"

enum jsb_result_t app_message_decode(struct jsb_deserializer_t* d,
                                     struct app_message_t* result) {
  {
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != 875542086) {
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_CHECK_ERROR(app_command_trait_decode(d, &result->command));
  {
    JSB_CHECK_ERROR(
        jsb_deserializer_read_uint8(d, &result->command1.has_value));
    if (result->command1.has_value != 1 && result->command1.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->command1. The returned value for "
                "optional was not zero or one: %d\n",
                result->command1.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->command1.has_value) {
      JSB_CHECK_ERROR(app_command_trait_decode(d, &result->command1.value));
    }
  }
  {
    JSB_CHECK_ERROR(
        jsb_deserializer_read_uint8(d, &result->command2.has_value));
    if (result->command2.has_value != 1 && result->command2.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->command2. The returned value for "
                "optional was not zero or one: %d\n",
                result->command2.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->command2.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->command2.value.has_value));
        if (result->command2.value.has_value != 1 &&
            result->command2.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->command2.value. The returned "
                    "value for optional was not zero or one: %d\n",
                    result->command2.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->command2.value.has_value) {
          JSB_CHECK_ERROR(
              app_command_trait_decode(d, &result->command2.value.value));
        }
      }
    }
  }
  {
    JSB_CHECK_ERROR(
        jsb_deserializer_read_uint8(d, &result->command3.has_value));
    if (result->command3.has_value != 1 && result->command3.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->command3. The returned value for "
                "optional was not zero or one: %d\n",
                result->command3.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->command3.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->command3.value.has_value));
        if (result->command3.value.has_value != 1 &&
            result->command3.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->command3.value. The returned "
                    "value for optional was not zero or one: %d\n",
                    result->command3.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->command3.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->command3.value.value.has_value));
            if (result->command3.value.value.has_value != 1 &&
                result->command3.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->command3.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->command3.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->command3.value.value.has_value) {
              JSB_CHECK_ERROR(app_command_trait_decode(
                  d, &result->command3.value.value.value));
            }
          }
        }
      }
    }
  }
  {
    JSB_CHECK_ERROR(
        jsb_deserializer_read_uint8(d, &result->command4.has_value));
    if (result->command4.has_value != 1 && result->command4.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->command4. The returned value for "
                "optional was not zero or one: %d\n",
                result->command4.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->command4.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->command4.value.has_value));
        if (result->command4.value.has_value != 1 &&
            result->command4.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->command4.value. The returned "
                    "value for optional was not zero or one: %d\n",
                    result->command4.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->command4.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->command4.value.value.has_value));
            if (result->command4.value.value.has_value != 1 &&
                result->command4.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->command4.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->command4.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->command4.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->command4.value.value.value.has_value));
                if (result->command4.value.value.value.has_value != 1 &&
                    result->command4.value.value.value.has_value != 0) {
                  JSB_TRACE("decode",
                            "Failed to decode "
                            "result->command4.value.value.value. The returned "
                            "value for optional was not zero or one: %d\n",
                            result->command4.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->command4.value.value.value.has_value) {
                  JSB_CHECK_ERROR(app_command_trait_decode(
                      d, &result->command4.value.value.value.value));
                }
              }
            }
          }
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_encode(const struct app_message_t* input,
                                     struct jsb_serializer_t* s) {
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 875542086));
  JSB_CHECK_ERROR(app_command_trait_encode(&input->command, s));
  if (input->command1.has_value) {
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    JSB_CHECK_ERROR(app_command_trait_encode(&input->command1.value, s));
  } else {
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->command2.has_value) {
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->command2.value.has_value) {
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      JSB_CHECK_ERROR(
          app_command_trait_encode(&input->command2.value.value, s));
    } else {
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->command3.has_value) {
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->command3.value.has_value) {
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->command3.value.value.has_value) {
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        JSB_CHECK_ERROR(
            app_command_trait_encode(&input->command3.value.value.value, s));
      } else {
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->command4.has_value) {
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->command4.value.has_value) {
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->command4.value.value.has_value) {
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->command4.value.value.value.has_value) {
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_CHECK_ERROR(app_command_trait_encode(
              &input->command4.value.value.value.value, s));
        } else {
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  return JSB_OK;
}

enum jsb_result_t app_message_init(struct app_message_t* value) {
  if (value == NULL)
    return JSB_BAD_ARGUMENT;
  JSB_CHECK_ERROR(
      app_command_trait_init(&value->command, APP_COMMAND_MOVE_FORWARD_TYPE));
  value->command1.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(&value->command1.value,
                                         APP_COMMAND_MOVE_FORWARD_TYPE));
  value->command2.has_value       = 0;
  value->command2.value.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(&value->command2.value.value,
                                         APP_COMMAND_MOVE_FORWARD_TYPE));
  value->command3.has_value             = 0;
  value->command3.value.has_value       = 0;
  value->command3.value.value.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(&value->command3.value.value.value,
                                         APP_COMMAND_MOVE_FORWARD_TYPE));
  value->command4.has_value                   = 0;
  value->command4.value.has_value             = 0;
  value->command4.value.value.has_value       = 0;
  value->command4.value.value.value.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(
      &value->command4.value.value.value.value, APP_COMMAND_MOVE_FORWARD_TYPE));
  return JSB_OK;
}

void app_message_free(struct app_message_t* s) {
  if (s == NULL)
    return;
  (void)s;
}
