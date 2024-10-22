#include "protocol/main/response_trait.h"

enum jsb_result_t protocol_main_response_trait_encode(const struct protocol_main_response_trait_t* input, struct jsb_serializer_t* s) {
  switch(input->type) {
    case PROTOCOL_MAIN_VOID_TYPE:
      JSB_TRACE("protocol_main_response_trait_encode/protocol.main.Response", "Encoding protocol.main.Void...");
      JSB_CHECK_ERROR(protocol_main_void_encode(&input->value.protocol_main_void,s));
      break;
    case PROTOCOL_MAIN_USER_TYPE:
      JSB_TRACE("protocol_main_response_trait_encode/protocol.main.Response", "Encoding protocol.main.User...");
      JSB_CHECK_ERROR(protocol_main_user_encode(&input->value.protocol_main_user,s));
      break;
    default:
      JSB_TRACE("protocol_main_response_trait_encode/protocol.main.Response", "Invalid type: %d. Maybe you've forgot to initialize `struct protocol_main_response_trait_t`?\n", input->type);
      return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

enum jsb_result_t protocol_main_response_trait_decode(struct jsb_deserializer_t* d, struct protocol_main_response_trait_t* output) {
  if(d == NULL) {
    JSB_TRACE("protocol_main_response_trait_decode", "Failed to decode protocol.main.Response, received NULL pointer for the deserializer parameter.");
    return JSB_BAD_ARGUMENT;
  }
  if(output == NULL) {
    JSB_TRACE("protocol_main_response_trait_decode", "Failed to decode protocol.main.Response, received NULL pointer for the output parameter.");
    return JSB_BAD_ARGUMENT;
  }
  jsb_int32_t header;
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
  JSB_CHECK_ERROR(jsb_deserializer_rewind(d, 4));
  switch(header) {
    case 357013552:
      JSB_TRACE("protocol_main_response_trait_decode/protocol.main.Response", "Decoding protocol.main.Void...");
      JSB_CHECK_ERROR(protocol_main_void_decode(d, &output->value.protocol_main_void));
      break;
    case 1081421617:
      JSB_TRACE("protocol_main_response_trait_decode/protocol.main.Response", "Decoding protocol.main.User...");
      JSB_CHECK_ERROR(protocol_main_user_decode(d, &output->value.protocol_main_user));
      break;
    default:
      JSB_TRACE("protocol.main.Response/decode", "Invalid decoded header: %d. Maybe you are decoding an incompatible or corrupted buffer?\n", header);
      return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

enum jsb_result_t protocol_main_response_trait_init(struct protocol_main_response_trait_t* input, enum protocol_main_response_type_t type) {
  if(input == NULL) {
    JSB_TRACE("protocol_main_response_trait_init", "Failed to initialize protocol.main.Response, received NULL pointer for the input parameter.");
    return JSB_BAD_ARGUMENT;
  }
  switch(type) {
    case PROTOCOL_MAIN_VOID_TYPE:
      JSB_TRACE("protocol_main_response_trait_init", "Initializing with the given header (%d): protocol.main.Void...", type);
      input->type = PROTOCOL_MAIN_VOID_TYPE;
      return protocol_main_void_init(&input->value.protocol_main_void);
    case PROTOCOL_MAIN_USER_TYPE:
      JSB_TRACE("protocol_main_response_trait_init", "Initializing with the given header (%d): protocol.main.User...", type);
      input->type = PROTOCOL_MAIN_USER_TYPE;
      return protocol_main_user_init(&input->value.protocol_main_user);
    default:
      JSB_TRACE("protocol.main.Response/initialize", "Invalid type: %d. Maybe you are initializing with an invalid header?.", type);
      return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

void protocol_main_response_trait_free(struct protocol_main_response_trait_t* trait) {
  if(trait == NULL) {
    JSB_TRACE("protocol_main_response_trait_free", "Failed to free 'protocol.main.Response', received NULL pointer.");
    return;
  }
  JSB_TRACE("protocol_main_response_trait_free", "Freeing trait: protocol.main.Response.");
  switch(trait->type) {
    case PROTOCOL_MAIN_VOID_TYPE:
      JSB_TRACE("protocol_main_response_trait_free", "Identified protocol.main.Response trait to have its value as: protocol.main.Void.");
      protocol_main_void_free(&trait->value.protocol_main_void);
      break;
    case PROTOCOL_MAIN_USER_TYPE:
      JSB_TRACE("protocol_main_response_trait_free", "Identified protocol.main.Response trait to have its value as: protocol.main.User.");
      protocol_main_user_free(&trait->value.protocol_main_user);
      break;
    default:
      JSB_TRACE("protocol.main.Response/free", "Invalid type: %d. Maybe you are freeing an uninitialized or corrupted buffer?\n", trait->type);
      break;
  }
}

