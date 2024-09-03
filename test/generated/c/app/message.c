#include "app/message.h"

enum jsb_result_t app_message_decode(struct jsb_deserializer_t* d, struct app_message_t* result) {
    {
        jsb_int32_t header;
        JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
        if(header != 569348178) {
            return JSB_INVALID_CRC_HEADER;
        }
    }
    JSB_CHECK_ERROR(app_command_trait_decode(d, &result->command));
    return JSB_OK;
}

enum jsb_result_t app_message_encode(const struct app_message_t* input, struct jsb_serializer_t* s) {
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 569348178));
    JSB_CHECK_ERROR(app_command_trait_encode(&input->command, s));
    return JSB_OK;
}
