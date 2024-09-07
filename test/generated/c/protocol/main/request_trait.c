#include "protocol/main/request_trait.h"

enum jsb_result_t protocol_main_request_trait_encode(
    const struct protocol_main_request_trait_t* input,
    struct jsb_serializer_t* s) {
  switch (input->type) {
  case PROTOCOL_MAIN_GET_USER_TYPE:
    JSB_CHECK_ERROR(
        protocol_main_get_user_encode(&input->value.protocol_main_get_user, s));
    break;
  default:
    return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

enum jsb_result_t protocol_main_request_trait_decode(
    struct jsb_deserializer_t* d,
    struct protocol_main_request_trait_t* output) {
  jsb_int32_t header;
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
  JSB_CHECK_ERROR(jsb_deserializer_rewind(d, 4));
  switch (header) {
  case -1150313593:
    JSB_CHECK_ERROR(protocol_main_get_user_decode(
        d, &output->value.protocol_main_get_user));
    break;
  default:
    return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

enum jsb_result_t
protocol_main_request_trait_init(struct protocol_main_request_trait_t* input,
                                 enum protocol_main_request_type_t type) {
  switch (type) {
  case PROTOCOL_MAIN_GET_USER_TYPE:
    input->type = PROTOCOL_MAIN_GET_USER_TYPE;
    return protocol_main_get_user_init(&input->value.protocol_main_get_user);
  default:
    return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

void protocol_main_request_trait_free(
    struct protocol_main_request_trait_t* trait) {
  if (trait == NULL)
    return;
  switch (trait->type) {
  case PROTOCOL_MAIN_GET_USER_TYPE:
    protocol_main_get_user_free(&trait->value.protocol_main_get_user);
    break;
  // Unrecognized `trait->type` value
  default:
    break;
  }
}
