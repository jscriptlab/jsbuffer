#include "protocol/main/request_trait.h"

enum jsb_result_t protocol_main_request_trait_encode(
    const struct protocol_main_request_trait_t* input,
    struct jsb_serializer_t* s) {
  switch (input->type) {
  case PROTOCOL_MAIN_GET_USER_TYPE:
    JSB_TRACE("protocol_main_request_trait_encode/protocol.main.Request",
              "Encoding protocol.main.GetUser...");
    JSB_CHECK_ERROR(
        protocol_main_get_user_encode(&input->value.protocol_main_get_user, s));
    break;
  default:
    JSB_TRACE("protocol_main_request_trait_encode/protocol.main.Request",
              "Invalid type: %d. Maybe you've forgot to initialize `struct "
              "protocol_main_request_trait_t`?\n",
              input->type);
    return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

enum jsb_result_t protocol_main_request_trait_decode(
    struct jsb_deserializer_t* d,
    struct protocol_main_request_trait_t* output) {
  if (d == NULL) {
    JSB_TRACE("protocol_main_request_trait_decode",
              "Failed to decode protocol.main.Request, received NULL pointer "
              "for the deserializer parameter.");
    return JSB_BAD_ARGUMENT;
  }
  if (output == NULL) {
    JSB_TRACE("protocol_main_request_trait_decode",
              "Failed to decode protocol.main.Request, received NULL pointer "
              "for the output parameter.");
    return JSB_BAD_ARGUMENT;
  }
  jsb_int32_t header;
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
  JSB_CHECK_ERROR(jsb_deserializer_rewind(d, 4));
  switch (header) {
  case -1150313593:
    JSB_TRACE("protocol_main_request_trait_decode/protocol.main.Request",
              "Decoding protocol.main.GetUser...");
    JSB_CHECK_ERROR(protocol_main_get_user_decode(
        d, &output->value.protocol_main_get_user));
    break;
  default:
    JSB_TRACE("protocol.main.Request/decode",
              "Invalid decoded header: %d. Maybe you are decoding an "
              "incompatible or corrupted buffer?\n",
              header);
    return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

enum jsb_result_t
protocol_main_request_trait_init(struct protocol_main_request_trait_t* input,
                                 enum protocol_main_request_type_t type) {
  if (input == NULL) {
    JSB_TRACE("protocol_main_request_trait_init",
              "Failed to initialize protocol.main.Request, received NULL "
              "pointer for the input parameter.");
    return JSB_BAD_ARGUMENT;
  }
  switch (type) {
  case PROTOCOL_MAIN_GET_USER_TYPE:
    JSB_TRACE(
        "protocol_main_request_trait_init",
        "Initializing with the given header (%d): protocol.main.GetUser...",
        type);
    input->type = PROTOCOL_MAIN_GET_USER_TYPE;
    return protocol_main_get_user_init(&input->value.protocol_main_get_user);
  default:
    JSB_TRACE(
        "protocol.main.Request/initialize",
        "Invalid type: %d. Maybe you are initializing with an invalid header?.",
        type);
    return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

void protocol_main_request_trait_free(
    struct protocol_main_request_trait_t* trait) {
  if (trait == NULL) {
    JSB_TRACE("protocol_main_request_trait_free",
              "Failed to free 'protocol.main.Request', received NULL pointer.");
    return;
  }
  JSB_TRACE("protocol_main_request_trait_free",
            "Freeing trait: protocol.main.Request.");
  switch (trait->type) {
  case PROTOCOL_MAIN_GET_USER_TYPE:
    JSB_TRACE("protocol_main_request_trait_free",
              "Identified protocol.main.Request trait to have its value as: "
              "protocol.main.GetUser.");
    protocol_main_get_user_free(&trait->value.protocol_main_get_user);
    break;
  default:
    JSB_TRACE("protocol.main.Request/free",
              "Invalid type: %d. Maybe you are freeing an uninitialized or "
              "corrupted buffer?\n",
              trait->type);
    break;
  }
}
