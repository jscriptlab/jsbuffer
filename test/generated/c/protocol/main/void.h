#ifndef JSB_PROTOCOL_MAIN_VOID_H
#define JSB_PROTOCOL_MAIN_VOID_H


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus


#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct protocol_main_void_t {
    jsb_int32_t value;
};
enum jsb_result_t protocol_main_void_decode(struct jsb_deserializer_t*, struct protocol_main_void_t*);
enum jsb_result_t protocol_main_void_encode(const struct protocol_main_void_t*, struct jsb_serializer_t*);
enum jsb_result_t protocol_main_void_init(struct protocol_main_void_t*);
void protocol_main_void_free(struct protocol_main_void_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_PROTOCOL_MAIN_VOID_H
