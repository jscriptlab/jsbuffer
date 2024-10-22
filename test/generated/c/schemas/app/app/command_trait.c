#include "app/command_trait.h"

enum jsb_result_t app_command_trait_encode(const struct app_command_trait_t* input, struct jsb_serializer_t* s) {
    switch(input->type) {
        case APP_COMMAND_MOVE_FORWARD_TYPE:
            JSB_TRACE("app_command_trait_encode/app.Command", "Encoding app.CommandMoveForward...");
            JSB_CHECK_ERROR(app_command_move_forward_encode(&input->value.app_command_move_forward,s));
            break;
        case APP_COMMAND_MOVE_BACKWARDS_TYPE:
            JSB_TRACE("app_command_trait_encode/app.Command", "Encoding app.CommandMoveBackwards...");
            JSB_CHECK_ERROR(app_command_move_backwards_encode(&input->value.app_command_move_backwards,s));
            break;
        default:
            JSB_TRACE("app_command_trait_encode/app.Command", "Invalid type: %d. Maybe you've forgot to initialize `struct app_command_trait_t`?\n", input->type);
            return JSB_INVALID_CRC_HEADER;
    }
    return JSB_OK;
}

enum jsb_result_t app_command_trait_decode(struct jsb_deserializer_t* d, struct app_command_trait_t* output) {
    if(d == NULL) {
        JSB_TRACE("app_command_trait_decode", "Failed to decode app.Command, received NULL pointer for the deserializer parameter.");
        return JSB_BAD_ARGUMENT;
    }
    if(output == NULL) {
        JSB_TRACE("app_command_trait_decode", "Failed to decode app.Command, received NULL pointer for the output parameter.");
        return JSB_BAD_ARGUMENT;
    }
    jsb_int32_t header;
    JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
    JSB_CHECK_ERROR(jsb_deserializer_rewind(d, 4));
    switch(header) {
        case 1407274108:
            JSB_TRACE("app_command_trait_decode/app.Command", "Decoding app.CommandMoveForward...");
            JSB_CHECK_ERROR(app_command_move_forward_decode(d, &output->value.app_command_move_forward));
            break;
        case 985001043:
            JSB_TRACE("app_command_trait_decode/app.Command", "Decoding app.CommandMoveBackwards...");
            JSB_CHECK_ERROR(app_command_move_backwards_decode(d, &output->value.app_command_move_backwards));
            break;
        default:
            JSB_TRACE("app.Command/decode", "Invalid decoded header: %d. Maybe you are decoding an incompatible or corrupted buffer?\n", header);
            return JSB_INVALID_CRC_HEADER;
    }
    return JSB_OK;
}

enum jsb_result_t app_command_trait_init(struct app_command_trait_t* input, enum app_command_type_t type) {
    if(input == NULL) {
        JSB_TRACE("app_command_trait_init", "Failed to initialize app.Command, received NULL pointer for the input parameter.");
        return JSB_BAD_ARGUMENT;
    }
    switch(type) {
        case APP_COMMAND_MOVE_FORWARD_TYPE:
            JSB_TRACE("app_command_trait_init", "Initializing with the given header (%d): app.CommandMoveForward...", type);
            input->type = APP_COMMAND_MOVE_FORWARD_TYPE;
            return app_command_move_forward_init(&input->value.app_command_move_forward);
        case APP_COMMAND_MOVE_BACKWARDS_TYPE:
            JSB_TRACE("app_command_trait_init", "Initializing with the given header (%d): app.CommandMoveBackwards...", type);
            input->type = APP_COMMAND_MOVE_BACKWARDS_TYPE;
            return app_command_move_backwards_init(&input->value.app_command_move_backwards);
        default:
            JSB_TRACE("app.Command/initialize", "Invalid type: %d. Maybe you are initializing with an invalid header?.", type);
            return JSB_INVALID_CRC_HEADER;
    }
    return JSB_OK;
}

void app_command_trait_free(struct app_command_trait_t* trait) {
    if(trait == NULL) {
        JSB_TRACE("app_command_trait_free", "Failed to free 'app.Command', received NULL pointer.");
        return;
    }
    JSB_TRACE("app_command_trait_free", "Freeing trait: app.Command.");
    switch(trait->type) {
        case APP_COMMAND_MOVE_FORWARD_TYPE:
            JSB_TRACE("app_command_trait_free", "Identified app.Command trait to have its value as: app.CommandMoveForward.");
            app_command_move_forward_free(&trait->value.app_command_move_forward);
            break;
        case APP_COMMAND_MOVE_BACKWARDS_TYPE:
            JSB_TRACE("app_command_trait_free", "Identified app.Command trait to have its value as: app.CommandMoveBackwards.");
            app_command_move_backwards_free(&trait->value.app_command_move_backwards);
            break;
        default:
            JSB_TRACE("app.Command/free", "Invalid type: %d. Maybe you are freeing an uninitialized or corrupted buffer?\n", trait->type);
            break;
    }
}

