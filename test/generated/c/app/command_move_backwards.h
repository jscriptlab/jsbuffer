#ifndef JSB_APP_COMMAND_MOVE_BACKWARDS_H
#define JSB_APP_COMMAND_MOVE_BACKWARDS_H


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct app_command_move_backwards_t {
    bool stop;
};
enum jsb_result_t app_command_move_backwards_decode(struct jsb_deserializer_t*, struct app_command_move_backwards_t*);
enum jsb_result_t app_command_move_backwards_encode(const struct app_command_move_backwards_t*, struct jsb_serializer_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_APP_COMMAND_MOVE_BACKWARDS_H
