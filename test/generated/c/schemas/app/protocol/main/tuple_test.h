#ifndef JSB_PROTOCOL_MAIN_TUPLE_TEST_H
#define JSB_PROTOCOL_MAIN_TUPLE_TEST_H


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include <string.h>
#include <jsb/jsb.h>
#include "protocol/main/user.h"
#include "protocol/main/void.h"

#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct protocol_main_tuple_test_tuple_t {
  jsb_int32_t item_0;
  jsb_string_t item_1;
  jsb_int32_t item_2;
  struct protocol_main_user_t item_3;
  struct protocol_main_void_t item_4;
  jsb_uint16_t item_5;
  jsb_uint32_t item_6;
  jsb_int16_t item_7;
  jsb_int8_t item_8;
  jsb_uint8_t item_9;
};
struct protocol_main_tuple_test_t {
  struct protocol_main_tuple_test_tuple_t values;
};
enum jsb_result_t protocol_main_tuple_test_decode(struct jsb_deserializer_t*, struct protocol_main_tuple_test_t*);
enum jsb_result_t protocol_main_tuple_test_encode(const struct protocol_main_tuple_test_t*, struct jsb_serializer_t*);
enum jsb_result_t protocol_main_tuple_test_init(struct protocol_main_tuple_test_t*);
void protocol_main_tuple_test_free(struct protocol_main_tuple_test_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_PROTOCOL_MAIN_TUPLE_TEST_H
