#ifndef JSB_SIMPLE_SCHEMA_POST_DELETED_H
#define JSB_SIMPLE_SCHEMA_POST_DELETED_H


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include <string.h>
#include <jsb/jsb.h>

#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct simple_schema_post_deleted_t {
    jsb_int32_t id;
    jsb_int32_t authorId;
    jsb_string_t title;
};
enum jsb_result_t simple_schema_post_deleted_decode(struct jsb_deserializer_t*, struct simple_schema_post_deleted_t*);
enum jsb_result_t simple_schema_post_deleted_encode(const struct simple_schema_post_deleted_t*, struct jsb_serializer_t*);
enum jsb_result_t simple_schema_post_deleted_init(struct simple_schema_post_deleted_t*);
void simple_schema_post_deleted_free(struct simple_schema_post_deleted_t*);
#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_SIMPLE_SCHEMA_POST_DELETED_H
