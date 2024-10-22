#include "simple_schema/user.h"

enum jsb_result_t simple_schema_user_decode(struct jsb_deserializer_t* d, struct simple_schema_user_t* result) {
    {
        JSB_TRACE("simple_schema_user_decode", "Decoding simple_schema.User...");
        jsb_int32_t header;
        JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
        if(header != -1196640358) {
            JSB_TRACE("simple_schema_user_decode", "Invalid CRC header for simple_schema.User. Expected -1196640358, but got %d instead.", header);
            return JSB_INVALID_CRC_HEADER;
        }
    }
    JSB_TRACE("simple_schema_user_decode", "Decoding id...");
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->id));
    JSB_TRACE("simple_schema_user_decode", "Decoding last_post...");
    {
        JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &result->last_post.has_value));
        if(result->last_post.has_value != 1 && result->last_post.has_value != 0) {
            JSB_TRACE("decode", "Failed to decode result->last_post. The returned value for optional was not zero or one: %d\n", result->last_post.has_value);
            return JSB_INVALID_DECODED_VALUE;
        }
        if(result->last_post.has_value) {
            JSB_CHECK_ERROR(simple_schema_post_trait_decode(d, &result->last_post.value));
        }
    }
    return JSB_OK;
}

enum jsb_result_t simple_schema_user_encode(const struct simple_schema_user_t* input, struct jsb_serializer_t* s) {
    JSB_TRACE("simple_schema_user_encode", "Encoding simple_schema.User...");
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, -1196640358));
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->id));
    if(input->last_post.has_value) {
        JSB_TRACE("", "Optional value of input->last_post is set.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));
        JSB_TRACE("", "Encoding simple_schema.Post...");
        JSB_CHECK_ERROR(simple_schema_post_trait_encode(&input->last_post.value, s));
    } else {
        JSB_TRACE("", "Optional value of input->last_post is empty.");
        JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));
    }
    return JSB_OK;
}

enum jsb_result_t simple_schema_user_init(struct simple_schema_user_t* value) {
    if(value == NULL) {
        JSB_TRACE("simple_schema_user_init", "Failed to initialize simple_schema.User, received value = NULL.");
        return JSB_BAD_ARGUMENT;
    }
    JSB_TRACE("simple_schema_user_init", "Initializing param of type \"jsb_int32_t\": id.");
    /**
     * jsb_int32_t
     */
    value->id = 0;
    JSB_TRACE("simple_schema_user_init", "Initialized param: id.");

    JSB_TRACE("simple_schema_user_init", "Initializing param of type \"struct simple_schema_user_post_optional_t\": last_post.");
    /**
     * struct simple_schema_user_post_optional_t
     */
    value->last_post.has_value = false;
    JSB_CHECK_ERROR(simple_schema_post_trait_init(&value->last_post.value, SIMPLE_SCHEMA_POST_ACTIVE_TYPE));
    JSB_TRACE("simple_schema_user_init", "Initialized param: last_post.");

    return JSB_OK;
}

void simple_schema_user_free(struct simple_schema_user_t* s) {
    if(s == NULL) return;
    (void)s;
}

enum jsb_result_t simple_schema_user_last_post_init(struct simple_schema_user_t* user, const struct simple_schema_post_trait_t* last_post){
    user->last_post.has_value = last_post != NULL;
    if(user->last_post.has_value) {
        if(last_post != NULL) {
            user->last_post.value = *last_post;
        }
    }
    return JSB_OK;
}

