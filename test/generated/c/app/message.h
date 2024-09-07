#ifndef JSB_APP_MESSAGE_H
#define JSB_APP_MESSAGE_H


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include "app/command_trait.h"

#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct app_message_t {
    struct app_command_trait_t command;
};
enum jsb_result_t app_message_decode(struct jsb_deserializer_t*, struct app_message_t*);
enum jsb_result_t app_message_encode(const struct app_message_t*, struct jsb_serializer_t*);
enum jsb_result_t app_message_init(struct app_message_t*);
void app_message_free(struct app_message_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_APP_MESSAGE_H