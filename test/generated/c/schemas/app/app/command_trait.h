#ifndef JSB_APP_COMMAND_TRAIT_H
#define JSB_APP_COMMAND_TRAIT_H

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include "app/command_move_backwards.h"
#include "app/command_move_forward.h"

#include <jsb/deserializer.h>
#include <jsb/serializer.h>

enum app_command_type_t {
#ifdef JSB_SCHEMA_NO_ASSIGNMENT_ENUMS
  APP_COMMAND_MOVE_FORWARD_TYPE,
  APP_COMMAND_MOVE_BACKWARDS_TYPE,
#else
  APP_COMMAND_MOVE_FORWARD_TYPE   = 1407274108,
  APP_COMMAND_MOVE_BACKWARDS_TYPE = 985001043,
#endif
};

union app_command_trait_value_t {
  struct app_command_move_forward_t app_command_move_forward;
  struct app_command_move_backwards_t app_command_move_backwards;
};

struct app_command_trait_t {
  enum app_command_type_t type;
  union app_command_trait_value_t value;
};

enum jsb_result_t
app_command_trait_encode(const struct app_command_trait_t* input,
                         struct jsb_serializer_t* s);
void app_command_trait_free(struct app_command_trait_t* input);
enum jsb_result_t app_command_trait_init(struct app_command_trait_t* input,
                                         enum app_command_type_t);
enum jsb_result_t app_command_trait_decode(struct jsb_deserializer_t* d,
                                           struct app_command_trait_t* result);
#ifdef __cplusplus
}
#endif // __cplusplus
#endif // JSB_APP_COMMAND_TRAIT_H