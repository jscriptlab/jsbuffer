#include "app/command_move_forward.h"

enum jsb_result_t app_command_move_forward_decode(struct jsb_deserializer_t* d, struct app_command_move_forward_t* result) {
    {
        jsb_int32_t header;
        JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
        if(header != -1007775659) {
            return JSB_INVALID_CRC_HEADER;
        }
    }
    {
        jsb_uint8_t value;
        JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &value));
        if(value != 1 && value != 0) return JSB_INVALID_DECODED_VALUE;
        result->stop = value == 1 ? true : false;
    }
    return JSB_OK;
}

enum jsb_result_t app_command_move_forward_encode(const struct app_command_move_forward_t* input, struct jsb_serializer_t* s) {
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, -1007775659));
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, input->stop ? 1 : 0));
    return JSB_OK;
}

enum jsb_result_t app_command_move_forward_init(struct app_command_move_forward_t* value) {
    if(value == NULL) return JSB_BAD_ARGUMENT;
    value->stop = false;
    return JSB_OK;
}

void app_command_move_forward_free(struct app_command_move_forward_t* s) {
    if(s == NULL) return;
    (void)s;
}

