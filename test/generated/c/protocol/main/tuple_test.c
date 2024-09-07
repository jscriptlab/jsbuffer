#include "protocol/main/tuple_test.h"

enum jsb_result_t
protocol_main_tuple_test_decode(struct jsb_deserializer_t* d,
                                struct protocol_main_tuple_test_t* result) {
  {
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    if (header != -1894699296) {
      return JSB_INVALID_CRC_HEADER;
    }
  }
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->values.item_0));
  {
    jsb_uint32_t len;
    JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &len));
    if (len > JSB_MAX_STRING_SIZE)
      return JSB_BUFFER_OVERFLOW;
    JSB_CHECK_ERROR(
        jsb_deserializer_read_buffer(d, len, result->values.item_1));
    result->values.item_1[len] = '\0';
  }
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->values.item_2));
  JSB_CHECK_ERROR(protocol_main_user_decode(d, &result->values.item_3));
  JSB_CHECK_ERROR(protocol_main_void_decode(d, &result->values.item_4));
  JSB_CHECK_ERROR(jsb_deserializer_read_uint16(d, &result->values.item_5));
  JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &result->values.item_6));
  JSB_CHECK_ERROR(jsb_deserializer_read_int16(d, &result->values.item_7));
  JSB_CHECK_ERROR(jsb_deserializer_read_int8(d, &result->values.item_8));
  JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->values.item_9));
  return JSB_OK;
}

enum jsb_result_t
protocol_main_tuple_test_encode(const struct protocol_main_tuple_test_t* input,
                                struct jsb_serializer_t* s) {
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, -1894699296));
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->values.item_0));
  {
    // Length of the buffer
    const jsb_uint32_t len = jsb_strlen(input->values.item_1);
    JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, len));
    JSB_CHECK_ERROR(jsb_serializer_write_buffer(s, input->values.item_1, len));
  }
  JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->values.item_2));
  JSB_CHECK_ERROR(protocol_main_user_encode(&input->values.item_3, s));
  JSB_CHECK_ERROR(protocol_main_void_encode(&input->values.item_4, s));
  JSB_CHECK_ERROR(jsb_serializer_write_uint16(s, input->values.item_5));
  JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, input->values.item_6));
  JSB_CHECK_ERROR(jsb_serializer_write_int16(s, input->values.item_7));
  JSB_CHECK_ERROR(jsb_serializer_write_int8(s, input->values.item_8));
  JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, input->values.item_9));
  return JSB_OK;
}

enum jsb_result_t
protocol_main_tuple_test_init(struct protocol_main_tuple_test_t* value) {
  if (value == NULL)
    return JSB_BAD_ARGUMENT;
  value->values.item_0 = 0;
  // Initialize string
  value->values.item_1[0] = '\0';
  value->values.item_2    = 0;
  JSB_CHECK_ERROR(protocol_main_user_init(&value->values.item_3));
  JSB_CHECK_ERROR(protocol_main_void_init(&value->values.item_4));
  value->values.item_5 = 0;
  value->values.item_6 = 0;
  value->values.item_7 = 0;
  value->values.item_8 = 0;
  value->values.item_9 = 0;
  return JSB_OK;
}

void protocol_main_tuple_test_free(struct protocol_main_tuple_test_t* s) {
  if (s == NULL)
    return;
  (void)s;
}
