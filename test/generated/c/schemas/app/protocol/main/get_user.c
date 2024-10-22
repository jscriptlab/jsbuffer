#include "protocol/main/get_user.h"

enum jsb_result_t protocol_main_get_user_decode(struct jsb_deserializer_t* d, struct protocol_main_get_user_t* result) {
    {
        JSB_TRACE("protocol_main_get_user_decode", "Decoding protocol.main.GetUser...");
        jsb_int32_t header;
        JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
        if(header != -1150313593) {
            JSB_TRACE("protocol_main_get_user_decode", "Invalid CRC header for protocol.main.GetUser. Expected -1150313593, but got %d instead.", header);
            return JSB_INVALID_CRC_HEADER;
        }
    }
    JSB_TRACE("protocol_main_get_user_decode", "Decoding id...");
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->id));
    return JSB_OK;
}

enum jsb_result_t protocol_main_get_user_encode(const struct protocol_main_get_user_t* input, struct jsb_serializer_t* s) {
    JSB_TRACE("protocol_main_get_user_encode", "Encoding protocol.main.GetUser...");
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, -1150313593));
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->id));
    return JSB_OK;
}

enum jsb_result_t protocol_main_get_user_init(struct protocol_main_get_user_t* value) {
    if(value == NULL) {
        JSB_TRACE("protocol_main_get_user_init", "Failed to initialize protocol.main.GetUser, received value = NULL.");
        return JSB_BAD_ARGUMENT;
    }
    JSB_TRACE("protocol_main_get_user_init", "Initializing param of type \"jsb_int32_t\": id.");
    /**
     * jsb_int32_t
     */
    value->id = 0;
    JSB_TRACE("protocol_main_get_user_init", "Initialized param: id.");

    return JSB_OK;
}

void protocol_main_get_user_free(struct protocol_main_get_user_t* s) {
    if(s == NULL) return;
    (void)s;
}

