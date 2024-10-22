#ifndef JSB_PROTOCOL_MAIN_USER_H
#define JSB_PROTOCOL_MAIN_USER_H


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include <string.h>
#include <jsb/jsb.h>

#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct protocol_main_user_t {
  jsb_int32_t id;
  jsb_string_t name;
};
enum jsb_result_t protocol_main_user_decode(struct jsb_deserializer_t*, struct protocol_main_user_t*);
enum jsb_result_t protocol_main_user_encode(const struct protocol_main_user_t*, struct jsb_serializer_t*);
enum jsb_result_t protocol_main_user_init(struct protocol_main_user_t*);
void protocol_main_user_free(struct protocol_main_user_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_PROTOCOL_MAIN_USER_H
