#ifndef JSB_PROTOCOL_MAIN_REQUEST_TRAIT_H
#define JSB_PROTOCOL_MAIN_REQUEST_TRAIT_H

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include "protocol/main/get_user.h"

#include <jsb/deserializer.h>
#include <jsb/serializer.h>
#include <stdbool.h>

enum protocol_main_request_type_t {
  PROTOCOL_MAIN_GET_USER_TYPE = -1150313593,
};

union protocol_main_request_trait_value_t {
  struct protocol_main_get_user_t protocol_main_get_user;
};

struct protocol_main_request_trait_t {
  enum protocol_main_request_type_t type;
  union protocol_main_request_trait_value_t value;
};

enum jsb_result_t protocol_main_request_trait_encode(
    const struct protocol_main_request_trait_t* input,
    struct jsb_serializer_t* s);
void protocol_main_request_trait_free(
    struct protocol_main_request_trait_t* input);
enum jsb_result_t
protocol_main_request_trait_init(struct protocol_main_request_trait_t* input,
                                 enum protocol_main_request_type_t);
enum jsb_result_t protocol_main_request_trait_decode(
    struct jsb_deserializer_t* d, struct protocol_main_request_trait_t* result);
#ifdef __cplusplus
}
#endif // __cplusplus
#endif // JSB_PROTOCOL_MAIN_REQUEST_TRAIT_H
