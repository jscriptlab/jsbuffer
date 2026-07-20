#ifndef JSB_SIMPLE_SCHEMA_POST_TRAIT_H
#define JSB_SIMPLE_SCHEMA_POST_TRAIT_H

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include "simple_schema/post_active.h"
#include "simple_schema/post_deleted.h"

#include <jsb/deserializer.h>
#include <jsb/serializer.h>

enum simple_schema_post_type_t {
#ifdef JSB_SCHEMA_NO_ASSIGNMENT_ENUMS
  SIMPLE_SCHEMA_POST_ACTIVE_TYPE,
  SIMPLE_SCHEMA_POST_DELETED_TYPE,
#else
  SIMPLE_SCHEMA_POST_ACTIVE_TYPE  = -968397368,
  SIMPLE_SCHEMA_POST_DELETED_TYPE = 1154524640,
#endif
};

union simple_schema_post_trait_value_t {
  struct simple_schema_post_active_t simple_schema_post_active;
  struct simple_schema_post_deleted_t simple_schema_post_deleted;
};

struct simple_schema_post_trait_t {
  enum simple_schema_post_type_t type;
  union simple_schema_post_trait_value_t value;
};

enum jsb_result_t
simple_schema_post_trait_encode(const struct simple_schema_post_trait_t* input,
                                struct jsb_serializer_t* s);
void simple_schema_post_trait_free(struct simple_schema_post_trait_t* input);
enum jsb_result_t
simple_schema_post_trait_init(struct simple_schema_post_trait_t* input,
                              enum simple_schema_post_type_t);
enum jsb_result_t
simple_schema_post_trait_decode(struct jsb_deserializer_t* d,
                                struct simple_schema_post_trait_t* result);
#ifdef __cplusplus
}
#endif // __cplusplus
#endif // JSB_SIMPLE_SCHEMA_POST_TRAIT_H
