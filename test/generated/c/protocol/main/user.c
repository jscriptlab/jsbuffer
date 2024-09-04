#include "protocol/main/user.h"

enum jsb_result_t protocol_main_user_decode(struct jsb_deserializer_t* d, struct protocol_main_user_t* result) {
    {
        jsb_int32_t header;
        JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
        if(header != 1081421617) {
            return JSB_INVALID_CRC_HEADER;
        }
    }
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &result->id));
    {
        jsb_uint32_t len;
        JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &len));
        if(len > JSB_MAX_STRING_SIZE) return JSB_BUFFER_OVERFLOW;
        JSB_CHECK_ERROR(jsb_deserializer_read_buffer(d, len, result->name));
        result->name[len] = '\0';
    }
    return JSB_OK;
}

enum jsb_result_t protocol_main_user_encode(const struct protocol_main_user_t* input, struct jsb_serializer_t* s) {
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 1081421617));
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, input->id));
    {
        // Length of the buffer
        const jsb_uint32_t len = jsb_strlen(input->name);
        JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, len));
        JSB_CHECK_ERROR(jsb_serializer_write_buffer(s, input->name, len));
    }
    return JSB_OK;
}

enum jsb_result_t protocol_main_user_init(struct protocol_main_user_t* value) {
    if(value == NULL) return JSB_BAD_ARGUMENT;
    value->id = 0;
    // Initialize string
    value->name[0] = '\0';
    return JSB_OK;
}

void protocol_main_user_free(struct protocol_main_user_t* s) {
    if(s == NULL) return;
    (void)s;
}

