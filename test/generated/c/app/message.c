#include "app/message.h"

enum jsb_result_t app_message_decode(struct jsb_deserializer_t* d,
                                     struct app_message_t* result) {
  {
    JSB_TRACE("app_message_decode", "Decoding app.Message...");
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != 875542086) {
      JSB_TRACE("app_message_decode",
                "Invalid CRC header for app.Message. Expected 875542086, but "
                "got %d instead.",
                header);
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_TRACE("app_message_decode", "Decoding command...");
  JSB_CHECK_ERROR(app_command_trait_decode(d, &result->command));
  JSB_TRACE("app_message_decode", "Decoding command1...");
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
  JSB_TRACE("app_message_decode", "Decoding command2...");
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
  JSB_TRACE("app_message_decode", "Decoding command3...");
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
  JSB_TRACE("app_message_decode", "Decoding command4...");
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
  JSB_TRACE("app_message_encode", "Encoding app.Message...");
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 875542086));
  JSB_TRACE("", "Encoding app.Command...");
  JSB_CHECK_ERROR(app_command_trait_encode(&input->command, s));
  if (input->command1.has_value) {
    JSB_TRACE("", "Optional value of input->command1 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    JSB_TRACE("", "Encoding app.Command...");
    JSB_CHECK_ERROR(app_command_trait_encode(&input->command1.value, s));
  } else {
    JSB_TRACE("", "Optional value of input->command1 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->command2.has_value) {
    JSB_TRACE("", "Optional value of input->command2 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->command2.value.has_value) {
      JSB_TRACE("", "Optional value of input->command2.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      JSB_TRACE("", "Encoding app.Command...");
      JSB_CHECK_ERROR(
          app_command_trait_encode(&input->command2.value.value, s));
    } else {
      JSB_TRACE("", "Optional value of input->command2.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->command2 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->command3.has_value) {
    JSB_TRACE("", "Optional value of input->command3 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->command3.value.has_value) {
      JSB_TRACE("", "Optional value of input->command3.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->command3.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->command3.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        JSB_TRACE("", "Encoding app.Command...");
        JSB_CHECK_ERROR(
            app_command_trait_encode(&input->command3.value.value.value, s));
      } else {
        JSB_TRACE("",
                  "Optional value of input->command3.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->command3.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->command3 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->command4.has_value) {
    JSB_TRACE("", "Optional value of input->command4 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->command4.value.has_value) {
      JSB_TRACE("", "Optional value of input->command4.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->command4.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->command4.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->command4.value.value.value.has_value) {
          JSB_TRACE(
              "",
              "Optional value of input->command4.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_TRACE("", "Encoding app.Command...");
          JSB_CHECK_ERROR(app_command_trait_encode(
              &input->command4.value.value.value.value, s));
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->command4.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("",
                  "Optional value of input->command4.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->command4.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->command4 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  return JSB_OK;
}

enum jsb_result_t app_message_init(struct app_message_t* value) {
  if (value == NULL) {
    JSB_TRACE("app_message_init",
              "Failed to initialize app.Message, received value = NULL.");
    return JSB_BAD_ARGUMENT;
  }
  JSB_TRACE("app_message_init", "Initializing param command...");
  JSB_CHECK_ERROR(
      app_command_trait_init(&value->command, APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param command.");
  JSB_TRACE("app_message_init", "Initializing param command1...");
  value->command1.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(&value->command1.value,
                                         APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param command1.");
  JSB_TRACE("app_message_init", "Initializing param command2...");
  value->command2.has_value       = 0;
  value->command2.value.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(&value->command2.value.value,
                                         APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param command2.");
  JSB_TRACE("app_message_init", "Initializing param command3...");
  value->command3.has_value             = 0;
  value->command3.value.has_value       = 0;
  value->command3.value.value.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(&value->command3.value.value.value,
                                         APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param command3.");
  JSB_TRACE("app_message_init", "Initializing param command4...");
  value->command4.has_value                   = 0;
  value->command4.value.has_value             = 0;
  value->command4.value.value.has_value       = 0;
  value->command4.value.value.value.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(
      &value->command4.value.value.value.value, APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param command4.");
  return JSB_OK;
}

void app_message_free(struct app_message_t* s) {
  if (s == NULL)
    return;
  (void)s;
}
