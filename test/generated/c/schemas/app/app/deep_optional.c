#include "app/deep_optional.h"

enum jsb_result_t app_deep_optional_decode(struct jsb_deserializer_t* d,
                                           struct app_deep_optional_t* result) {
  {
    JSB_TRACE("app_deep_optional_decode", "Decoding app.DeepOptional...");
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != -576678332) {
      JSB_TRACE("app_deep_optional_decode",
                "Invalid CRC header for app.DeepOptional. Expected -576678332, "
                "but got %d instead.",
                header);
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_TRACE("app_deep_optional_decode", "Decoding value...");
  {
    JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->value.has_value));
    if (result->value.has_value != 1 && result->value.has_value != 0) {
      JSB_TRACE("decode",
                "Failed to decode result->value. The returned value for "
                "optional was not zero or one: %d\n",
                result->value.has_value);
      return JSB_INVALID_DECODED_VALUE;
    }
    if (result->value.has_value) {
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
            jsb_deserializer_read_buffer(d, len, result->value.value));
        result->value.value[len] = '\0';
      }
    }
  }
  JSB_TRACE("app_deep_optional_decode", "Decoding value2...");
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
          JSB_CHECK_ERROR(
              jsb_deserializer_read_int32(d, &result->value2.value.value));
        }
      }
    }
  }
  return JSB_OK;
}

enum jsb_result_t
app_deep_optional_encode(const struct app_deep_optional_t* input,
                         struct jsb_serializer_t* s) {
  JSB_TRACE("app_deep_optional_encode", "Encoding app.DeepOptional...");
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, -576678332));
  if (input->value.has_value) {
    JSB_TRACE("", "Optional value of input->value is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    {
      // Length of the buffer
      const jsb_uint32_t len = jsb_strlen(input->value.value);
      JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, len));
      JSB_CHECK_ERROR(jsb_serializer_write_buffer(s, input->value.value, len));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  if (input->value2.has_value) {
    JSB_TRACE("", "Optional value of input->value2 is set.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
    if (input->value2.value.has_value) {
      JSB_TRACE("", "Optional value of input->value2.value is set.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
      JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->value2.value.value));
    } else {
      JSB_TRACE("", "Optional value of input->value2.value is empty.");
      JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
  } else {
    JSB_TRACE("", "Optional value of input->value2 is empty.");
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
  }
  return JSB_OK;
}

enum jsb_result_t app_deep_optional_init(struct app_deep_optional_t* value) {
  if (value == NULL) {
    JSB_TRACE("app_deep_optional_init",
              "Failed to initialize app.DeepOptional, received value = NULL.");
    return JSB_BAD_ARGUMENT;
  }
  JSB_TRACE("app_deep_optional_init", "Initializing param value...");
  value->value.has_value = 0;
#ifdef JSB_SCHEMA_MALLOC
  jsb_memset(value->value.value, 0, jsb_strlen(value->value.value));
#else
  jsb_memset(&value->value.value, 0, JSB_MAX_STRING_SIZE);
  value->value.value[JSB_MAX_STRING_SIZE] = 0;
#endif // JSB_SCHEMA_MALLOC
  JSB_TRACE("app_deep_optional_init", "Initialized param value.");
  JSB_TRACE("app_deep_optional_init", "Initializing param value2...");
  value->value2.has_value       = 0;
  value->value2.value.has_value = 0;
  value->value2.value.value     = 0;
  JSB_TRACE("app_deep_optional_init", "Initialized param value2.");
  return JSB_OK;
}

void app_deep_optional_free(struct app_deep_optional_t* s) {
  if (s == NULL)
    return;
  (void)s;
}

enum jsb_result_t
app_deep_optional_value_init(struct app_deep_optional_t* deep_optional,
                             const jsb_string_t* value) {
  deep_optional->value.has_value = value != NULL;
  if (deep_optional->value.has_value) {
    jsb_memcpy(&deep_optional->value.value, &value, jsb_strlen(*value));
  }
  return JSB_OK;
}

enum jsb_result_t
app_deep_optional_value2_init(struct app_deep_optional_t* deep_optional,
                              const jsb_int32_t* value2) {
  deep_optional->value2.has_value = value2 != NULL;
  if (deep_optional->value2.has_value) {
    deep_optional->value2.value.has_value = value2 != NULL;
    if (deep_optional->value2.value.has_value) {
      deep_optional->value2.value.value = *value2;
    }
  }
  return JSB_OK;
}
