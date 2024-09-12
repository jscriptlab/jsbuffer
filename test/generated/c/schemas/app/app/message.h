#ifndef JSB_APP_MESSAGE_H
#define JSB_APP_MESSAGE_H

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include "app/command_trait.h"

#include <jsb/deserializer.h>
#include <jsb/serializer.h>
#include <stdbool.h>

struct app_message_command_optional_t {
  jsb_uint8_t has_value;
  struct app_command_trait_t value;
};

struct app_message_command_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_command_optional_t value;
};

struct app_message_command_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_command_optional_optional_t value;
};

struct app_message_command_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_command_optional_optional_optional_t value;
};

struct app_message_t {
  struct app_command_trait_t command;
  struct app_message_command_optional_t command1;
  struct app_message_command_optional_optional_t command2;
  struct app_message_command_optional_optional_optional_t command3;
  struct app_message_command_optional_optional_optional_optional_t command4;
};
enum jsb_result_t app_message_decode(struct jsb_deserializer_t*,
                                     struct app_message_t*);
enum jsb_result_t app_message_encode(const struct app_message_t*,
                                     struct jsb_serializer_t*);
enum jsb_result_t app_message_init(struct app_message_t*);
void app_message_free(struct app_message_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_APP_MESSAGE_H
