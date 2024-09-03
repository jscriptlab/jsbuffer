#include "app/command_trait.h"

enum jsb_result_t app_command_trait_encode(const struct app_command_trait_t* input, struct jsb_serializer_t* s) {
    switch(input->type) {
        case APP_COMMAND_MOVE_FORWARD_TYPE:
            JSB_CHECK_ERROR(app_command_move_forward_encode(&input->value.app_command_move_forward,s));
            break;
        case APP_COMMAND_MOVE_BACKWARDS_TYPE:
            JSB_CHECK_ERROR(app_command_move_backwards_encode(&input->value.app_command_move_backwards,s));
            break;
    }
    return JSB_OK;
}

enum jsb_result_t app_command_trait_decode(struct jsb_deserializer_t* d, struct app_command_trait_t* output) {
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    JSB_CHECK_ERROR(jsb_deserializer_rewind(d, 4));
    switch(header) {
        case -1007775659:
            JSB_CHECK_ERROR(app_command_move_forward_decode(d, &output->value.app_command_move_forward));
            break;
        case 494129866:
            JSB_CHECK_ERROR(app_command_move_backwards_decode(d, &output->value.app_command_move_backwards));
            break;
        default:
            return JSB_INVALID_CRC_HEADER;
    }
    return JSB_OK;
}
