#ifndef JSB_SIMPLE_SCHEMA_USER_H
#define JSB_SIMPLE_SCHEMA_USER_H

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include "simple_schema/post_trait.h"

#include <jsb/deserializer.h>
#include <jsb/serializer.h>
#include <stdbool.h>

struct simple_schema_user_post_optional_t {
  jsb_uint8_t has_value;
  struct simple_schema_post_trait_t value;
};

struct simple_schema_user_t {
  jsb_int32_t id;
  struct simple_schema_user_post_optional_t last_post;
};
enum jsb_result_t simple_schema_user_decode(struct jsb_deserializer_t*,
                                            struct simple_schema_user_t*);
enum jsb_result_t simple_schema_user_encode(const struct simple_schema_user_t*,
                                            struct jsb_serializer_t*);
enum jsb_result_t simple_schema_user_init(struct simple_schema_user_t*);
void simple_schema_user_free(struct simple_schema_user_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_SIMPLE_SCHEMA_USER_H
