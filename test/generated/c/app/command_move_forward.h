#ifndef JSB_APP_COMMAND_MOVE_FORWARD_H
#define JSB_APP_COMMAND_MOVE_FORWARD_H


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct app_command_move_forward_t {
    bool stop;
};
enum jsb_result_t app_command_move_forward_decode(struct jsb_deserializer_t*, struct app_command_move_forward_t*);
enum jsb_result_t app_command_move_forward_encode(const struct app_command_move_forward_t*, struct jsb_serializer_t*);
enum jsb_result_t app_command_move_forward_init(struct app_command_move_forward_t*);
void app_command_move_forward_free(struct app_command_move_forward_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_APP_COMMAND_MOVE_FORWARD_H
