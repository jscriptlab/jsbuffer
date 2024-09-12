#ifndef JSB_SIMPLE_SCHEMA_POST_ACTIVE_H
#define JSB_SIMPLE_SCHEMA_POST_ACTIVE_H

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include <jsb/jsb.h>
#include <string.h>

#include <jsb/deserializer.h>
#include <jsb/serializer.h>
#include <stdbool.h>

struct simple_schema_post_active_t {
  jsb_int32_t id;
  jsb_int32_t authorId;
  jsb_string_t title;
};
enum jsb_result_t
simple_schema_post_active_decode(struct jsb_deserializer_t*,
                                 struct simple_schema_post_active_t*);
enum jsb_result_t
simple_schema_post_active_encode(const struct simple_schema_post_active_t*,
                                 struct jsb_serializer_t*);
enum jsb_result_t
simple_schema_post_active_init(struct simple_schema_post_active_t*);
void simple_schema_post_active_free(struct simple_schema_post_active_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_SIMPLE_SCHEMA_POST_ACTIVE_H
