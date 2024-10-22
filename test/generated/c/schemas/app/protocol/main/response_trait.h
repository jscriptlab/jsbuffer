#ifndef JSB_PROTOCOL_MAIN_RESPONSE_TRAIT_H
#define JSB_PROTOCOL_MAIN_RESPONSE_TRAIT_H


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include "protocol/main/void.h"
#include "protocol/main/user.h"

#include <jsb/serializer.h>
#include <jsb/deserializer.h>

enum protocol_main_response_type_t {
#ifdef JSB_SCHEMA_NO_ASSIGNMENT_ENUMS
  PROTOCOL_MAIN_VOID_TYPE,
  PROTOCOL_MAIN_USER_TYPE,
#else
  PROTOCOL_MAIN_VOID_TYPE = 357013552,
  PROTOCOL_MAIN_USER_TYPE = 1081421617,
#endif
};

union protocol_main_response_trait_value_t {
  struct protocol_main_void_t protocol_main_void;
  struct protocol_main_user_t protocol_main_user;
};

struct protocol_main_response_trait_t {
  enum protocol_main_response_type_t type;
  union protocol_main_response_trait_value_t value;
};

enum jsb_result_t protocol_main_response_trait_encode(const struct protocol_main_response_trait_t* input, struct jsb_serializer_t* s);
void protocol_main_response_trait_free(struct protocol_main_response_trait_t* input);
enum jsb_result_t protocol_main_response_trait_init(struct protocol_main_response_trait_t* input,enum protocol_main_response_type_t);
enum jsb_result_t protocol_main_response_trait_decode(struct jsb_deserializer_t* d, struct protocol_main_response_trait_t* result);
#ifdef __cplusplus
}
#endif // __cplusplus
#endif // JSB_PROTOCOL_MAIN_RESPONSE_TRAIT_H

