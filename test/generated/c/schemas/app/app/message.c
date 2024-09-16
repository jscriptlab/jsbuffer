#include "app/message.h"

enum jsb_result_t app_message_decode(struct jsb_deserializer_t* d,
                                     struct app_message_t* result) {
  {
    JSB_TRACE("app_message_decode", "Decoding app.Message...");
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != 1001184143) {
      JSB_TRACE("app_message_decode",
                "Invalid CRC header for app.Message. Expected 1001184143, but "
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
  JSB_TRACE("app_message_decode", "Decoding value1...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value1.has_value));
    if (result->value1.has_value != 1 && result->value1.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value1. The returned value for "
                "optional was not zero or one: %d\n",
                result->value1.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value1.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->value1.value.has_value));
        if (result->value1.value.has_value != 1 &&
            result->value1.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->value1.value. The returned value "
                    "for optional was not zero or one: %d\n",
                    result->value1.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->value1.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->value1.value.value.has_value));
            if (result->value1.value.value.has_value != 1 &&
                result->value1.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->value1.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->value1.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->value1.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->value1.value.value.value.has_value));
                if (result->value1.value.value.value.has_value != 1 &&
                    result->value1.value.value.value.has_value != 0) {
                  JSB_TRACE(
                      "decode",
                      "Failed to decode result->value1.value.value.value. The "
                      "returned value for optional was not zero or one: %d\n",
                      result->value1.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->value1.value.value.value.has_value) {
                  JSB_CHECK_ERROR(jsb_deserializer_read_int32(
                      d, &result->value1.value.value.value.value));
                }
              }
            }
          }
        }
      }
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value2...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value2.has_value));
    if (result->value2.has_value != 1 && result->value2.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value2. The returned value for "
                "optional was not zero or one: %d\n",
                result->value2.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value2.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->value2.value.has_value));
        if (result->value2.value.has_value != 1 &&
            result->value2.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->value2.value. The returned value "
                    "for optional was not zero or one: %d\n",
                    result->value2.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->value2.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->value2.value.value.has_value));
            if (result->value2.value.value.has_value != 1 &&
                result->value2.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->value2.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->value2.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->value2.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->value2.value.value.value.has_value));
                if (result->value2.value.value.value.has_value != 1 &&
                    result->value2.value.value.value.has_value != 0) {
                  JSB_TRACE(
                      "decode",
                      "Failed to decode result->value2.value.value.value. The "
                      "returned value for optional was not zero or one: %d\n",
                      result->value2.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->value2.value.value.value.has_value) {
                  JSB_CHECK_ERROR(jsb_deserializer_read_int16(
                      d, &result->value2.value.value.value.value));
                }
              }
            }
          }
        }
      }
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value3...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value3.has_value));
    if (result->value3.has_value != 1 && result->value3.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value3. The returned value for "
                "optional was not zero or one: %d\n",
                result->value3.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value3.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->value3.value.has_value));
        if (result->value3.value.has_value != 1 &&
            result->value3.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->value3.value. The returned value "
                    "for optional was not zero or one: %d\n",
                    result->value3.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->value3.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->value3.value.value.has_value));
            if (result->value3.value.value.has_value != 1 &&
                result->value3.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->value3.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->value3.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->value3.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->value3.value.value.value.has_value));
                if (result->value3.value.value.value.has_value != 1 &&
                    result->value3.value.value.value.has_value != 0) {
                  JSB_TRACE(
                      "decode",
                      "Failed to decode result->value3.value.value.value. The "
                      "returned value for optional was not zero or one: %d\n",
                      result->value3.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->value3.value.value.value.has_value) {
                  JSB_CHECK_ERROR(jsb_deserializer_read_int8(
                      d, &result->value3.value.value.value.value));
                }
              }
            }
          }
        }
      }
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value4...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value4.has_value));
    if (result->value4.has_value != 1 && result->value4.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value4. The returned value for "
                "optional was not zero or one: %d\n",
                result->value4.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value4.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->value4.value.has_value));
        if (result->value4.value.has_value != 1 &&
            result->value4.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->value4.value. The returned value "
                    "for optional was not zero or one: %d\n",
                    result->value4.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->value4.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->value4.value.value.has_value));
            if (result->value4.value.value.has_value != 1 &&
                result->value4.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->value4.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->value4.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->value4.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->value4.value.value.value.has_value));
                if (result->value4.value.value.value.has_value != 1 &&
                    result->value4.value.value.value.has_value != 0) {
                  JSB_TRACE(
                      "decode",
                      "Failed to decode result->value4.value.value.value. The "
                      "returned value for optional was not zero or one: %d\n",
                      result->value4.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->value4.value.value.value.has_value) {
                  JSB_CHECK_ERROR(jsb_deserializer_read_int32(
                      d, &result->value4.value.value.value.value));
                }
              }
            }
          }
        }
      }
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value5...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value5.has_value));
    if (result->value5.has_value != 1 && result->value5.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value5. The returned value for "
                "optional was not zero or one: %d\n",
                result->value5.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value5.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->value5.value.has_value));
        if (result->value5.value.has_value != 1 &&
            result->value5.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->value5.value. The returned value "
                    "for optional was not zero or one: %d\n",
                    result->value5.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->value5.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->value5.value.value.has_value));
            if (result->value5.value.value.has_value != 1 &&
                result->value5.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->value5.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->value5.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->value5.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->value5.value.value.value.has_value));
                if (result->value5.value.value.value.has_value != 1 &&
                    result->value5.value.value.value.has_value != 0) {
                  JSB_TRACE(
                      "decode",
                      "Failed to decode result->value5.value.value.value. The "
                      "returned value for optional was not zero or one: %d\n",
                      result->value5.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->value5.value.value.value.has_value) {
                  JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                      d, &result->value5.value.value.value.value));
                }
              }
            }
          }
        }
      }
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value6...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value6.has_value));
    if (result->value6.has_value != 1 && result->value6.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value6. The returned value for "
                "optional was not zero or one: %d\n",
                result->value6.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value6.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->value6.value.has_value));
        if (result->value6.value.has_value != 1 &&
            result->value6.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->value6.value. The returned value "
                    "for optional was not zero or one: %d\n",
                    result->value6.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->value6.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->value6.value.value.has_value));
            if (result->value6.value.value.has_value != 1 &&
                result->value6.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->value6.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->value6.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->value6.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->value6.value.value.value.has_value));
                if (result->value6.value.value.value.has_value != 1 &&
                    result->value6.value.value.value.has_value != 0) {
                  JSB_TRACE(
                      "decode",
                      "Failed to decode result->value6.value.value.value. The "
                      "returned value for optional was not zero or one: %d\n",
                      result->value6.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->value6.value.value.value.has_value) {
                  JSB_CHECK_ERROR(jsb_deserializer_read_uint16(
                      d, &result->value6.value.value.value.value));
                }
              }
            }
          }
        }
      }
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value7...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value7.has_value));
    if (result->value7.has_value != 1 && result->value7.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value7. The returned value for "
                "optional was not zero or one: %d\n",
                result->value7.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value7.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->value7.value.has_value));
        if (result->value7.value.has_value != 1 &&
            result->value7.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->value7.value. The returned value "
                    "for optional was not zero or one: %d\n",
                    result->value7.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->value7.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->value7.value.value.has_value));
            if (result->value7.value.value.has_value != 1 &&
                result->value7.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->value7.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->value7.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->value7.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->value7.value.value.value.has_value));
                if (result->value7.value.value.value.has_value != 1 &&
                    result->value7.value.value.value.has_value != 0) {
                  JSB_TRACE(
                      "decode",
                      "Failed to decode result->value7.value.value.value. The "
                      "returned value for optional was not zero or one: %d\n",
                      result->value7.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->value7.value.value.value.has_value) {
                  JSB_CHECK_ERROR(jsb_deserializer_read_uint32(
                      d, &result->value7.value.value.value.value));
                }
              }
            }
          }
        }
      }
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value8...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value8.has_value));
    if (result->value8.has_value != 1 && result->value8.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value8. The returned value for "
                "optional was not zero or one: %d\n",
                result->value8.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value8.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->value8.value.has_value));
        if (result->value8.value.has_value != 1 &&
            result->value8.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->value8.value. The returned value "
                    "for optional was not zero or one: %d\n",
                    result->value8.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->value8.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->value8.value.value.has_value));
            if (result->value8.value.value.has_value != 1 &&
                result->value8.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->value8.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->value8.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->value8.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->value8.value.value.value.has_value));
                if (result->value8.value.value.value.has_value != 1 &&
                    result->value8.value.value.value.has_value != 0) {
                  JSB_TRACE(
                      "decode",
                      "Failed to decode result->value8.value.value.value. The "
                      "returned value for optional was not zero or one: %d\n",
                      result->value8.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->value8.value.value.value.has_value) {
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
                    JSB_CHECK_ERROR(jsb_deserializer_read_buffer(
                        d, len, result->value8.value.value.value.value));
                    result->value8.value.value.value.value[len] = '\0';
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value9...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value9.has_value));
    if (result->value9.has_value != 1 && result->value9.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value9. The returned value for "
                "optional was not zero or one: %d\n",
                result->value9.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value9.has_value) {
      JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->value9.value));
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value10...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value10.has_value));
    if (result->value10.has_value != 1 && result->value10.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value10. The returned value for "
                "optional was not zero or one: %d\n",
                result->value10.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value10.has_value) {
      JSB_CHECK_ERROR(jsb_deserializer_read_int16(d, &result->value10.value));
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value11...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value11.has_value));
    if (result->value11.has_value != 1 && result->value11.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value11. The returned value for "
                "optional was not zero or one: %d\n",
                result->value11.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value11.has_value) {
      JSB_CHECK_ERROR(jsb_deserializer_read_int8(d, &result->value11.value));
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value12...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value12.has_value));
    if (result->value12.has_value != 1 && result->value12.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value12. The returned value for "
                "optional was not zero or one: %d\n",
                result->value12.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value12.has_value) {
      JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->value12.value));
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value13...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value13.has_value));
    if (result->value13.has_value != 1 && result->value13.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value13. The returned value for "
                "optional was not zero or one: %d\n",
                result->value13.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value13.has_value) {
      JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value13.value));
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value14...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value14.has_value));
    if (result->value14.has_value != 1 && result->value14.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value14. The returned value for "
                "optional was not zero or one: %d\n",
                result->value14.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value14.has_value) {
      JSB_CHECK_ERROR(jsb_deserializer_read_uint16(d, &result->value14.value));
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value15...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value15.has_value));
    if (result->value15.has_value != 1 && result->value15.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value15. The returned value for "
                "optional was not zero or one: %d\n",
                result->value15.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value15.has_value) {
      JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &result->value15.value));
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value16...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value16.has_value));
    if (result->value16.has_value != 1 && result->value16.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value16. The returned value for "
                "optional was not zero or one: %d\n",
                result->value16.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value16.has_value) {
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
        JSB_CHECK_ERROR(
            jsb_deserializer_read_buffer(d, len, result->value16.value));
        result->value16.value[len] = '\0';
      }
    }
  }
  JSB_TRACE("app_message_decode", "Decoding value17...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value17.has_value));
    if (result->value17.has_value != 1 && result->value17.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value17. The returned value for "
                "optional was not zero or one: %d\n",
                result->value17.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value17.has_value) {
      {
        JSB_CHECK_ERROR(
            jsb_deserializer_read_uint8(d, &result->value17.value.has_value));
        if (result->value17.value.has_value != 1 &&
            result->value17.value.has_value != 0) {
          JSB_TRACE("decode",
                    "Failed to decode result->value17.value. The returned "
                    "value for optional was not zero or one: %d\n",
                    result->value17.value.has_value);
          return JSB_INVALID_DECODED_VALUE;
        }
        if (result->value17.value.has_value) {
          {
            JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                d, &result->value17.value.value.has_value));
            if (result->value17.value.value.has_value != 1 &&
                result->value17.value.value.has_value != 0) {
              JSB_TRACE("decode",
                        "Failed to decode result->value17.value.value. The "
                        "returned value for optional was not zero or one: %d\n",
                        result->value17.value.value.has_value);
              return JSB_INVALID_DECODED_VALUE;
            }
            if (result->value17.value.value.has_value) {
              {
                JSB_CHECK_ERROR(jsb_deserializer_read_uint8(
                    d, &result->value17.value.value.value.has_value));
                if (result->value17.value.value.value.has_value != 1 &&
                    result->value17.value.value.value.has_value != 0) {
                  JSB_TRACE(
                      "decode",
                      "Failed to decode result->value17.value.value.value. The "
                      "returned value for optional was not zero or one: %d\n",
                      result->value17.value.value.value.has_value);
                  return JSB_INVALID_DECODED_VALUE;
                }
                if (result->value17.value.value.value.has_value) {
                  JSB_CHECK_ERROR(app_deep_optional_decode(
                      d, &result->value17.value.value.value.value));
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
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 1001184143));
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
  if (input->value1.has_value) {
    JSB_TRACE("", "Optional value of input->value1 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value1.value.has_value) {
      JSB_TRACE("", "Optional value of input->value1.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->value1.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->value1.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->value1.value.value.value.has_value) {
          JSB_TRACE(
              "", "Optional value of input->value1.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_CHECK_ERROR(jsb_serializer_write_int32(
              s, input->value1.value.value.value.value));
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->value1.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("", "Optional value of input->value1.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->value1.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value1 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value2.has_value) {
    JSB_TRACE("", "Optional value of input->value2 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value2.value.has_value) {
      JSB_TRACE("", "Optional value of input->value2.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->value2.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->value2.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->value2.value.value.value.has_value) {
          JSB_TRACE(
              "", "Optional value of input->value2.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_CHECK_ERROR(jsb_serializer_write_int16(
              s, input->value2.value.value.value.value));
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->value2.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("", "Optional value of input->value2.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->value2.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value2 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value3.has_value) {
    JSB_TRACE("", "Optional value of input->value3 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value3.value.has_value) {
      JSB_TRACE("", "Optional value of input->value3.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->value3.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->value3.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->value3.value.value.value.has_value) {
          JSB_TRACE(
              "", "Optional value of input->value3.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_CHECK_ERROR(jsb_serializer_write_int8(
              s, input->value3.value.value.value.value));
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->value3.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("", "Optional value of input->value3.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->value3.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value3 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value4.has_value) {
    JSB_TRACE("", "Optional value of input->value4 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value4.value.has_value) {
      JSB_TRACE("", "Optional value of input->value4.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->value4.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->value4.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->value4.value.value.value.has_value) {
          JSB_TRACE(
              "", "Optional value of input->value4.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_CHECK_ERROR(jsb_serializer_write_int32(
              s, input->value4.value.value.value.value));
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->value4.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("", "Optional value of input->value4.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->value4.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value4 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value5.has_value) {
    JSB_TRACE("", "Optional value of input->value5 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value5.value.has_value) {
      JSB_TRACE("", "Optional value of input->value5.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->value5.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->value5.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->value5.value.value.value.has_value) {
          JSB_TRACE(
              "", "Optional value of input->value5.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(
              s, input->value5.value.value.value.value));
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->value5.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("", "Optional value of input->value5.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->value5.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value5 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value6.has_value) {
    JSB_TRACE("", "Optional value of input->value6 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value6.value.has_value) {
      JSB_TRACE("", "Optional value of input->value6.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->value6.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->value6.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->value6.value.value.value.has_value) {
          JSB_TRACE(
              "", "Optional value of input->value6.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_CHECK_ERROR(jsb_serializer_write_uint16(
              s, input->value6.value.value.value.value));
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->value6.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("", "Optional value of input->value6.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->value6.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value6 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value7.has_value) {
    JSB_TRACE("", "Optional value of input->value7 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value7.value.has_value) {
      JSB_TRACE("", "Optional value of input->value7.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->value7.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->value7.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->value7.value.value.value.has_value) {
          JSB_TRACE(
              "", "Optional value of input->value7.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_CHECK_ERROR(jsb_serializer_write_uint32(
              s, input->value7.value.value.value.value));
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->value7.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("", "Optional value of input->value7.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->value7.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value7 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value8.has_value) {
    JSB_TRACE("", "Optional value of input->value8 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value8.value.has_value) {
      JSB_TRACE("", "Optional value of input->value8.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->value8.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->value8.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->value8.value.value.value.has_value) {
          JSB_TRACE(
              "", "Optional value of input->value8.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          {
            // Length of the buffer
            const jsb_uint32_t len =
                jsb_strlen(input->value8.value.value.value.value);
            JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, len));
            JSB_CHECK_ERROR(jsb_serializer_write_buffer(
                s, input->value8.value.value.value.value, len));
          }
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->value8.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("", "Optional value of input->value8.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->value8.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value8 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value9.has_value) {
    JSB_TRACE("", "Optional value of input->value9 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->value9.value));
  } else {
    JSB_TRACE("", "Optional value of input->value9 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value10.has_value) {
    JSB_TRACE("", "Optional value of input->value10 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    JSB_CHECK_ERROR(jsb_serializer_write_int16(s, input->value10.value));
  } else {
    JSB_TRACE("", "Optional value of input->value10 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value11.has_value) {
    JSB_TRACE("", "Optional value of input->value11 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    JSB_CHECK_ERROR(jsb_serializer_write_int8(s, input->value11.value));
  } else {
    JSB_TRACE("", "Optional value of input->value11 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value12.has_value) {
    JSB_TRACE("", "Optional value of input->value12 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->value12.value));
  } else {
    JSB_TRACE("", "Optional value of input->value12 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value13.has_value) {
    JSB_TRACE("", "Optional value of input->value13 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, input->value13.value));
  } else {
    JSB_TRACE("", "Optional value of input->value13 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value14.has_value) {
    JSB_TRACE("", "Optional value of input->value14 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    JSB_CHECK_ERROR(jsb_serializer_write_uint16(s, input->value14.value));
  } else {
    JSB_TRACE("", "Optional value of input->value14 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value15.has_value) {
    JSB_TRACE("", "Optional value of input->value15 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, input->value15.value));
  } else {
    JSB_TRACE("", "Optional value of input->value15 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value16.has_value) {
    JSB_TRACE("", "Optional value of input->value16 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    {
      // Length of the buffer
      const jsb_uint32_t len = jsb_strlen(input->value16.value);
      JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, len));
      JSB_CHECK_ERROR(
          jsb_serializer_write_buffer(s, input->value16.value, len));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value16 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value17.has_value) {
    JSB_TRACE("", "Optional value of input->value17 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value17.value.has_value) {
      JSB_TRACE("", "Optional value of input->value17.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      if (input->value17.value.value.has_value) {
        JSB_TRACE("", "Optional value of input->value17.value.value is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        if (input->value17.value.value.value.has_value) {
          JSB_TRACE(
              "", "Optional value of input->value17.value.value.value is set.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
          JSB_TRACE("", "Encoding app.DeepOptional...");
          JSB_CHECK_ERROR(app_deep_optional_encode(
              &input->value17.value.value.value.value, s));
        } else {
          JSB_TRACE(
              "",
              "Optional value of input->value17.value.value.value is empty.");
          JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
        }
      } else {
        JSB_TRACE("", "Optional value of input->value17.value.value is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
      }
    } else {
      JSB_TRACE("", "Optional value of input->value17.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value17 is empty.");
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

#ifdef JSB_SCHEMA_MALLOC
  /**
   * When JSB_SCHEMA_MALLOC is defined, we need to check for pointers before
   * calling memset. Otherwise, the allocated memory will be corrupted.
   */
#error "JSB_SCHEMA_MALLOC is not yet implemented"
#else
  jsb_memset(value, 0, sizeof(struct app_message_t));
#endif

  JSB_TRACE(
      "app_message_init",
      "Initializing param of type \"struct app_command_trait_t\": command.");
  JSB_CHECK_ERROR(
      app_command_trait_init(&value->command, APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param: command.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_command_optional_t\": command1.");
  /**
   * struct app_message_command_optional_t
   */
  jsb_memset(&value->command1, 0,
             sizeof(struct app_message_command_optional_t));

  value->command1.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(&value->command1.value,
                                         APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param: command1.");

  JSB_TRACE("app_message_init",
            "Initializing param of type \"struct "
            "app_message_command_optional_optional_t\": command2.");
  /**
   * struct app_message_command_optional_optional_t
   */
  jsb_memset(&value->command2, 0,
             sizeof(struct app_message_command_optional_optional_t));

  value->command2.has_value = 0;
  /**
   * struct app_message_command_optional_t
   */
  jsb_memset(&value->command2.value, 0,
             sizeof(struct app_message_command_optional_t));

  value->command2.value.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(&value->command2.value.value,
                                         APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param: command2.");

  JSB_TRACE("app_message_init",
            "Initializing param of type \"struct "
            "app_message_command_optional_optional_optional_t\": command3.");
  /**
   * struct app_message_command_optional_optional_optional_t
   */
  jsb_memset(&value->command3, 0,
             sizeof(struct app_message_command_optional_optional_optional_t));

  value->command3.has_value = 0;
  /**
   * struct app_message_command_optional_optional_t
   */
  jsb_memset(&value->command3.value, 0,
             sizeof(struct app_message_command_optional_optional_t));

  value->command3.value.has_value = 0;
  /**
   * struct app_message_command_optional_t
   */
  jsb_memset(&value->command3.value.value, 0,
             sizeof(struct app_message_command_optional_t));

  value->command3.value.value.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(&value->command3.value.value.value,
                                         APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param: command3.");

  JSB_TRACE(
      "app_message_init",
      "Initializing param of type \"struct "
      "app_message_command_optional_optional_optional_optional_t\": command4.");
  /**
   * struct app_message_command_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->command4, 0,
      sizeof(struct app_message_command_optional_optional_optional_optional_t));

  value->command4.has_value = 0;
  /**
   * struct app_message_command_optional_optional_optional_t
   */
  jsb_memset(&value->command4.value, 0,
             sizeof(struct app_message_command_optional_optional_optional_t));

  value->command4.value.has_value = 0;
  /**
   * struct app_message_command_optional_optional_t
   */
  jsb_memset(&value->command4.value.value, 0,
             sizeof(struct app_message_command_optional_optional_t));

  value->command4.value.value.has_value = 0;
  /**
   * struct app_message_command_optional_t
   */
  jsb_memset(&value->command4.value.value.value, 0,
             sizeof(struct app_message_command_optional_t));

  value->command4.value.value.value.has_value = 0;
  JSB_CHECK_ERROR(app_command_trait_init(
      &value->command4.value.value.value.value, APP_COMMAND_MOVE_FORWARD_TYPE));
  JSB_TRACE("app_message_init", "Initialized param: command4.");

  JSB_TRACE("app_message_init",
            "Initializing param of type \"struct "
            "app_message_int_optional_optional_optional_optional_t\": value1.");
  /**
   * struct app_message_int_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value1, 0,
      sizeof(struct app_message_int_optional_optional_optional_optional_t));

  value->value1.has_value = 0;
  /**
   * struct app_message_int_optional_optional_optional_t
   */
  jsb_memset(&value->value1.value, 0,
             sizeof(struct app_message_int_optional_optional_optional_t));

  value->value1.value.has_value = 0;
  /**
   * struct app_message_int_optional_optional_t
   */
  jsb_memset(&value->value1.value.value, 0,
             sizeof(struct app_message_int_optional_optional_t));

  value->value1.value.value.has_value = 0;
  /**
   * struct app_message_int_optional_t
   */
  jsb_memset(&value->value1.value.value.value, 0,
             sizeof(struct app_message_int_optional_t));

  value->value1.value.value.value.has_value = 0;
  /**
   * jsb_int32_t
   */
  value->value1.value.value.value.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value1.");

  JSB_TRACE(
      "app_message_init",
      "Initializing param of type \"struct "
      "app_message_int16_optional_optional_optional_optional_t\": value2.");
  /**
   * struct app_message_int16_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value2, 0,
      sizeof(struct app_message_int16_optional_optional_optional_optional_t));

  value->value2.has_value = 0;
  /**
   * struct app_message_int16_optional_optional_optional_t
   */
  jsb_memset(&value->value2.value, 0,
             sizeof(struct app_message_int16_optional_optional_optional_t));

  value->value2.value.has_value = 0;
  /**
   * struct app_message_int16_optional_optional_t
   */
  jsb_memset(&value->value2.value.value, 0,
             sizeof(struct app_message_int16_optional_optional_t));

  value->value2.value.value.has_value = 0;
  /**
   * struct app_message_int16_optional_t
   */
  jsb_memset(&value->value2.value.value.value, 0,
             sizeof(struct app_message_int16_optional_t));

  value->value2.value.value.value.has_value = 0;
  /**
   * jsb_int16_t
   */
  value->value2.value.value.value.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value2.");

  JSB_TRACE(
      "app_message_init",
      "Initializing param of type \"struct "
      "app_message_int8_optional_optional_optional_optional_t\": value3.");
  /**
   * struct app_message_int8_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value3, 0,
      sizeof(struct app_message_int8_optional_optional_optional_optional_t));

  value->value3.has_value = 0;
  /**
   * struct app_message_int8_optional_optional_optional_t
   */
  jsb_memset(&value->value3.value, 0,
             sizeof(struct app_message_int8_optional_optional_optional_t));

  value->value3.value.has_value = 0;
  /**
   * struct app_message_int8_optional_optional_t
   */
  jsb_memset(&value->value3.value.value, 0,
             sizeof(struct app_message_int8_optional_optional_t));

  value->value3.value.value.has_value = 0;
  /**
   * struct app_message_int8_optional_t
   */
  jsb_memset(&value->value3.value.value.value, 0,
             sizeof(struct app_message_int8_optional_t));

  value->value3.value.value.value.has_value = 0;
  /**
   * jsb_int8_t
   */
  value->value3.value.value.value.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value3.");

  JSB_TRACE(
      "app_message_init",
      "Initializing param of type \"struct "
      "app_message_int32_optional_optional_optional_optional_t\": value4.");
  /**
   * struct app_message_int32_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value4, 0,
      sizeof(struct app_message_int32_optional_optional_optional_optional_t));

  value->value4.has_value = 0;
  /**
   * struct app_message_int32_optional_optional_optional_t
   */
  jsb_memset(&value->value4.value, 0,
             sizeof(struct app_message_int32_optional_optional_optional_t));

  value->value4.value.has_value = 0;
  /**
   * struct app_message_int32_optional_optional_t
   */
  jsb_memset(&value->value4.value.value, 0,
             sizeof(struct app_message_int32_optional_optional_t));

  value->value4.value.value.has_value = 0;
  /**
   * struct app_message_int32_optional_t
   */
  jsb_memset(&value->value4.value.value.value, 0,
             sizeof(struct app_message_int32_optional_t));

  value->value4.value.value.value.has_value = 0;
  /**
   * jsb_int32_t
   */
  value->value4.value.value.value.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value4.");

  JSB_TRACE(
      "app_message_init",
      "Initializing param of type \"struct "
      "app_message_uint8_optional_optional_optional_optional_t\": value5.");
  /**
   * struct app_message_uint8_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value5, 0,
      sizeof(struct app_message_uint8_optional_optional_optional_optional_t));

  value->value5.has_value = 0;
  /**
   * struct app_message_uint8_optional_optional_optional_t
   */
  jsb_memset(&value->value5.value, 0,
             sizeof(struct app_message_uint8_optional_optional_optional_t));

  value->value5.value.has_value = 0;
  /**
   * struct app_message_uint8_optional_optional_t
   */
  jsb_memset(&value->value5.value.value, 0,
             sizeof(struct app_message_uint8_optional_optional_t));

  value->value5.value.value.has_value = 0;
  /**
   * struct app_message_uint8_optional_t
   */
  jsb_memset(&value->value5.value.value.value, 0,
             sizeof(struct app_message_uint8_optional_t));

  value->value5.value.value.value.has_value = 0;
  /**
   * jsb_uint8_t
   */
  value->value5.value.value.value.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value5.");

  JSB_TRACE(
      "app_message_init",
      "Initializing param of type \"struct "
      "app_message_uint16_optional_optional_optional_optional_t\": value6.");
  /**
   * struct app_message_uint16_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value6, 0,
      sizeof(struct app_message_uint16_optional_optional_optional_optional_t));

  value->value6.has_value = 0;
  /**
   * struct app_message_uint16_optional_optional_optional_t
   */
  jsb_memset(&value->value6.value, 0,
             sizeof(struct app_message_uint16_optional_optional_optional_t));

  value->value6.value.has_value = 0;
  /**
   * struct app_message_uint16_optional_optional_t
   */
  jsb_memset(&value->value6.value.value, 0,
             sizeof(struct app_message_uint16_optional_optional_t));

  value->value6.value.value.has_value = 0;
  /**
   * struct app_message_uint16_optional_t
   */
  jsb_memset(&value->value6.value.value.value, 0,
             sizeof(struct app_message_uint16_optional_t));

  value->value6.value.value.value.has_value = 0;
  /**
   * jsb_uint16_t
   */
  value->value6.value.value.value.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value6.");

  JSB_TRACE(
      "app_message_init",
      "Initializing param of type \"struct "
      "app_message_uint32_optional_optional_optional_optional_t\": value7.");
  /**
   * struct app_message_uint32_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value7, 0,
      sizeof(struct app_message_uint32_optional_optional_optional_optional_t));

  value->value7.has_value = 0;
  /**
   * struct app_message_uint32_optional_optional_optional_t
   */
  jsb_memset(&value->value7.value, 0,
             sizeof(struct app_message_uint32_optional_optional_optional_t));

  value->value7.value.has_value = 0;
  /**
   * struct app_message_uint32_optional_optional_t
   */
  jsb_memset(&value->value7.value.value, 0,
             sizeof(struct app_message_uint32_optional_optional_t));

  value->value7.value.value.has_value = 0;
  /**
   * struct app_message_uint32_optional_t
   */
  jsb_memset(&value->value7.value.value.value, 0,
             sizeof(struct app_message_uint32_optional_t));

  value->value7.value.value.value.has_value = 0;
  /**
   * jsb_uint32_t
   */
  value->value7.value.value.value.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value7.");

  JSB_TRACE(
      "app_message_init",
      "Initializing param of type \"struct "
      "app_message_string_optional_optional_optional_optional_t\": value8.");
  /**
   * struct app_message_string_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value8, 0,
      sizeof(struct app_message_string_optional_optional_optional_optional_t));

  value->value8.has_value = 0;
  /**
   * struct app_message_string_optional_optional_optional_t
   */
  jsb_memset(&value->value8.value, 0,
             sizeof(struct app_message_string_optional_optional_optional_t));

  value->value8.value.has_value = 0;
  /**
   * struct app_message_string_optional_optional_t
   */
  jsb_memset(&value->value8.value.value, 0,
             sizeof(struct app_message_string_optional_optional_t));

  value->value8.value.value.has_value = 0;
  /**
   * struct app_message_string_optional_t
   */
  jsb_memset(&value->value8.value.value.value, 0,
             sizeof(struct app_message_string_optional_t));

  value->value8.value.value.value.has_value = 0;
  /**
   * jsb_string_t
   */
#ifdef JSB_SCHEMA_MALLOC
  /**
   * Here we should have something similar the following options:
   *
   * 1. Have additional value->value8.value.value.value.value_len and
   * value->value8.value.value.value.value_capacity members in order to control
   * the maximum capacity of the memory block and be able to fully set it to
   * zero.
   *
   * 2. We could simply stick to the null-terminated string in order to keep it
   * simple.
   *
   * 3. Whenever JSB_SCHEMA_MALLOC is defined, we could implement both of the
   * behaviors above, if feasible.
   */
#error "JSB_SCHEMA_MALLOC is not implemented yet"
#else
  jsb_memset(&value->value8.value.value.value.value, 0, JSB_MAX_STRING_SIZE);
  value->value8.value.value.value.value[JSB_MAX_STRING_SIZE] = 0;
#endif // JSB_SCHEMA_MALLOC
  JSB_TRACE("app_message_init", "Initialized param: value8.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_int_optional_t\": value9.");
  /**
   * struct app_message_int_optional_t
   */
  jsb_memset(&value->value9, 0, sizeof(struct app_message_int_optional_t));

  value->value9.has_value = 0;
  /**
   * jsb_int32_t
   */
  value->value9.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value9.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_int16_optional_t\": value10.");
  /**
   * struct app_message_int16_optional_t
   */
  jsb_memset(&value->value10, 0, sizeof(struct app_message_int16_optional_t));

  value->value10.has_value = 0;
  /**
   * jsb_int16_t
   */
  value->value10.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value10.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_int8_optional_t\": value11.");
  /**
   * struct app_message_int8_optional_t
   */
  jsb_memset(&value->value11, 0, sizeof(struct app_message_int8_optional_t));

  value->value11.has_value = 0;
  /**
   * jsb_int8_t
   */
  value->value11.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value11.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_int32_optional_t\": value12.");
  /**
   * struct app_message_int32_optional_t
   */
  jsb_memset(&value->value12, 0, sizeof(struct app_message_int32_optional_t));

  value->value12.has_value = 0;
  /**
   * jsb_int32_t
   */
  value->value12.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value12.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_uint8_optional_t\": value13.");
  /**
   * struct app_message_uint8_optional_t
   */
  jsb_memset(&value->value13, 0, sizeof(struct app_message_uint8_optional_t));

  value->value13.has_value = 0;
  /**
   * jsb_uint8_t
   */
  value->value13.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value13.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_uint16_optional_t\": value14.");
  /**
   * struct app_message_uint16_optional_t
   */
  jsb_memset(&value->value14, 0, sizeof(struct app_message_uint16_optional_t));

  value->value14.has_value = 0;
  /**
   * jsb_uint16_t
   */
  value->value14.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value14.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_uint32_optional_t\": value15.");
  /**
   * struct app_message_uint32_optional_t
   */
  jsb_memset(&value->value15, 0, sizeof(struct app_message_uint32_optional_t));

  value->value15.has_value = 0;
  /**
   * jsb_uint32_t
   */
  value->value15.value = 0;
  JSB_TRACE("app_message_init", "Initialized param: value15.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_string_optional_t\": value16.");
  /**
   * struct app_message_string_optional_t
   */
  jsb_memset(&value->value16, 0, sizeof(struct app_message_string_optional_t));

  value->value16.has_value = 0;
  /**
   * jsb_string_t
   */
#ifdef JSB_SCHEMA_MALLOC
  /**
   * Here we should have something similar the following options:
   *
   * 1. Have additional value->value16.value_len and
   * value->value16.value_capacity members in order to control the maximum
   * capacity of the memory block and be able to fully set it to zero.
   *
   * 2. We could simply stick to the null-terminated string in order to keep it
   * simple.
   *
   * 3. Whenever JSB_SCHEMA_MALLOC is defined, we could implement both of the
   * behaviors above, if feasible.
   */
#error "JSB_SCHEMA_MALLOC is not implemented yet"
#else
  jsb_memset(&value->value16.value, 0, JSB_MAX_STRING_SIZE);
  value->value16.value[JSB_MAX_STRING_SIZE] = 0;
#endif // JSB_SCHEMA_MALLOC
  JSB_TRACE("app_message_init", "Initialized param: value16.");

  JSB_TRACE("app_message_init", "Initializing param of type \"struct "
                                "app_message_deepoptional_optional_optional_"
                                "optional_optional_t\": value17.");
  /**
   * struct app_message_deepoptional_optional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value17, 0,
      sizeof(struct
             app_message_deepoptional_optional_optional_optional_optional_t));

  value->value17.has_value = 0;
  /**
   * struct app_message_deepoptional_optional_optional_optional_t
   */
  jsb_memset(
      &value->value17.value, 0,
      sizeof(struct app_message_deepoptional_optional_optional_optional_t));

  value->value17.value.has_value = 0;
  /**
   * struct app_message_deepoptional_optional_optional_t
   */
  jsb_memset(&value->value17.value.value, 0,
             sizeof(struct app_message_deepoptional_optional_optional_t));

  value->value17.value.value.has_value = 0;
  /**
   * struct app_message_deepoptional_optional_t
   */
  jsb_memset(&value->value17.value.value.value, 0,
             sizeof(struct app_message_deepoptional_optional_t));

  value->value17.value.value.value.has_value = 0;
  JSB_CHECK_ERROR(
      app_deep_optional_init(&value->value17.value.value.value.value));
  JSB_TRACE("app_message_init", "Initialized param: value17.");

  return JSB_OK;
}

void app_message_free(struct app_message_t* s) {
  if (s == NULL)
    return;
  (void)s;
}

enum jsb_result_t
app_message_command1_init(struct app_message_t* message,
                          const struct app_command_trait_t* command1) {
  message->command1.has_value = command1 != NULL;
  if (message->command1.has_value) {
    if (command1 != NULL) {
      message->command1.value = *command1;
    }
  }
  return JSB_OK;
}

enum jsb_result_t
app_message_command2_init(struct app_message_t* message,
                          const struct app_command_trait_t* command2) {
  message->command2.has_value = command2 != NULL;
  if (message->command2.has_value) {
    message->command2.value.has_value = command2 != NULL;
    if (message->command2.value.has_value) {
      if (command2 != NULL) {
        message->command2.value.value = *command2;
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t
app_message_command3_init(struct app_message_t* message,
                          const struct app_command_trait_t* command3) {
  message->command3.has_value = command3 != NULL;
  if (message->command3.has_value) {
    message->command3.value.has_value = command3 != NULL;
    if (message->command3.value.has_value) {
      message->command3.value.value.has_value = command3 != NULL;
      if (message->command3.value.value.has_value) {
        if (command3 != NULL) {
          message->command3.value.value.value = *command3;
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t
app_message_command4_init(struct app_message_t* message,
                          const struct app_command_trait_t* command4) {
  message->command4.has_value = command4 != NULL;
  if (message->command4.has_value) {
    message->command4.value.has_value = command4 != NULL;
    if (message->command4.value.has_value) {
      message->command4.value.value.has_value = command4 != NULL;
      if (message->command4.value.value.has_value) {
        message->command4.value.value.value.has_value = command4 != NULL;
        if (message->command4.value.value.value.has_value) {
          if (command4 != NULL) {
            message->command4.value.value.value.value = *command4;
          }
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value1_init(struct app_message_t* message,
                                          const jsb_int32_t* value1) {
  message->value1.has_value = value1 != NULL;
  if (message->value1.has_value) {
    message->value1.value.has_value = value1 != NULL;
    if (message->value1.value.has_value) {
      message->value1.value.value.has_value = value1 != NULL;
      if (message->value1.value.value.has_value) {
        message->value1.value.value.value.has_value = value1 != NULL;
        if (message->value1.value.value.value.has_value) {
          message->value1.value.value.value.value = *value1;
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value2_init(struct app_message_t* message,
                                          const jsb_int16_t* value2) {
  message->value2.has_value = value2 != NULL;
  if (message->value2.has_value) {
    message->value2.value.has_value = value2 != NULL;
    if (message->value2.value.has_value) {
      message->value2.value.value.has_value = value2 != NULL;
      if (message->value2.value.value.has_value) {
        message->value2.value.value.value.has_value = value2 != NULL;
        if (message->value2.value.value.value.has_value) {
          message->value2.value.value.value.value = *value2;
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value3_init(struct app_message_t* message,
                                          const jsb_int8_t* value3) {
  message->value3.has_value = value3 != NULL;
  if (message->value3.has_value) {
    message->value3.value.has_value = value3 != NULL;
    if (message->value3.value.has_value) {
      message->value3.value.value.has_value = value3 != NULL;
      if (message->value3.value.value.has_value) {
        message->value3.value.value.value.has_value = value3 != NULL;
        if (message->value3.value.value.value.has_value) {
          message->value3.value.value.value.value = *value3;
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value4_init(struct app_message_t* message,
                                          const jsb_int32_t* value4) {
  message->value4.has_value = value4 != NULL;
  if (message->value4.has_value) {
    message->value4.value.has_value = value4 != NULL;
    if (message->value4.value.has_value) {
      message->value4.value.value.has_value = value4 != NULL;
      if (message->value4.value.value.has_value) {
        message->value4.value.value.value.has_value = value4 != NULL;
        if (message->value4.value.value.value.has_value) {
          message->value4.value.value.value.value = *value4;
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value5_init(struct app_message_t* message,
                                          const jsb_uint8_t* value5) {
  message->value5.has_value = value5 != NULL;
  if (message->value5.has_value) {
    message->value5.value.has_value = value5 != NULL;
    if (message->value5.value.has_value) {
      message->value5.value.value.has_value = value5 != NULL;
      if (message->value5.value.value.has_value) {
        message->value5.value.value.value.has_value = value5 != NULL;
        if (message->value5.value.value.value.has_value) {
          message->value5.value.value.value.value = *value5;
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value6_init(struct app_message_t* message,
                                          const jsb_uint16_t* value6) {
  message->value6.has_value = value6 != NULL;
  if (message->value6.has_value) {
    message->value6.value.has_value = value6 != NULL;
    if (message->value6.value.has_value) {
      message->value6.value.value.has_value = value6 != NULL;
      if (message->value6.value.value.has_value) {
        message->value6.value.value.value.has_value = value6 != NULL;
        if (message->value6.value.value.value.has_value) {
          message->value6.value.value.value.value = *value6;
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value7_init(struct app_message_t* message,
                                          const jsb_uint32_t* value7) {
  message->value7.has_value = value7 != NULL;
  if (message->value7.has_value) {
    message->value7.value.has_value = value7 != NULL;
    if (message->value7.value.has_value) {
      message->value7.value.value.has_value = value7 != NULL;
      if (message->value7.value.value.has_value) {
        message->value7.value.value.value.has_value = value7 != NULL;
        if (message->value7.value.value.value.has_value) {
          message->value7.value.value.value.value = *value7;
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value8_init(struct app_message_t* message,
                                          const jsb_string_t* value8) {
  message->value8.has_value = value8 != NULL;
  if (message->value8.has_value) {
    message->value8.value.has_value = value8 != NULL;
    if (message->value8.value.has_value) {
      message->value8.value.value.has_value = value8 != NULL;
      if (message->value8.value.value.has_value) {
        message->value8.value.value.value.has_value = value8 != NULL;
        if (message->value8.value.value.value.has_value) {
          jsb_memcpy(&message->value8.value.value.value.value, &value8,
                     jsb_strlen(*value8));
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value9_init(struct app_message_t* message,
                                          const jsb_int32_t* value9) {
  message->value9.has_value = value9 != NULL;
  if (message->value9.has_value) {
    message->value9.value = *value9;
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value10_init(struct app_message_t* message,
                                           const jsb_int16_t* value10) {
  message->value10.has_value = value10 != NULL;
  if (message->value10.has_value) {
    message->value10.value = *value10;
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value11_init(struct app_message_t* message,
                                           const jsb_int8_t* value11) {
  message->value11.has_value = value11 != NULL;
  if (message->value11.has_value) {
    message->value11.value = *value11;
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value12_init(struct app_message_t* message,
                                           const jsb_int32_t* value12) {
  message->value12.has_value = value12 != NULL;
  if (message->value12.has_value) {
    message->value12.value = *value12;
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value13_init(struct app_message_t* message,
                                           const jsb_uint8_t* value13) {
  message->value13.has_value = value13 != NULL;
  if (message->value13.has_value) {
    message->value13.value = *value13;
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value14_init(struct app_message_t* message,
                                           const jsb_uint16_t* value14) {
  message->value14.has_value = value14 != NULL;
  if (message->value14.has_value) {
    message->value14.value = *value14;
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value15_init(struct app_message_t* message,
                                           const jsb_uint32_t* value15) {
  message->value15.has_value = value15 != NULL;
  if (message->value15.has_value) {
    message->value15.value = *value15;
  }
  return JSB_OK;
}

enum jsb_result_t app_message_value16_init(struct app_message_t* message,
                                           const jsb_string_t* value16) {
  message->value16.has_value = value16 != NULL;
  if (message->value16.has_value) {
    jsb_memcpy(&message->value16.value, &value16, jsb_strlen(*value16));
  }
  return JSB_OK;
}

enum jsb_result_t
app_message_value17_init(struct app_message_t* message,
                         const struct app_deep_optional_t* value17) {
  message->value17.has_value = value17 != NULL;
  if (message->value17.has_value) {
    message->value17.value.has_value = value17 != NULL;
    if (message->value17.value.has_value) {
      message->value17.value.value.has_value = value17 != NULL;
      if (message->value17.value.value.has_value) {
        message->value17.value.value.value.has_value = value17 != NULL;
        if (message->value17.value.value.value.has_value) {
          if (value17 != NULL) {
            message->value17.value.value.value.value = *value17;
          }
        }
      }
    }
  }
  return JSB_OK;
}
