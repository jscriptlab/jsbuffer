#ifndef JSB_PROTOCOL_MAIN_GET_USER_H
#define JSB_PROTOCOL_MAIN_GET_USER_H

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include <jsb/deserializer.h>
#include <jsb/serializer.h>
#include <stdbool.h>

struct protocol_main_get_user_t {
  jsb_int32_t id;
};
enum jsb_result_t
protocol_main_get_user_decode(struct jsb_deserializer_t*,
                              struct protocol_main_get_user_t*);
enum jsb_result_t
protocol_main_get_user_encode(const struct protocol_main_get_user_t*,
                              struct jsb_serializer_t*);
enum jsb_result_t protocol_main_get_user_init(struct protocol_main_get_user_t*);
void protocol_main_get_user_free(struct protocol_main_get_user_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_PROTOCOL_MAIN_GET_USER_H
