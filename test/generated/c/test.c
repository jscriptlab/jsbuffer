#include <stdio.h>
#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

#include "app/message.h"
#include "app/command_move_forward.h"
#include "app/command_move_backwards.h"
#include "app/command_trait.h"
#include "protocol/main/request_trait.h"
#include "protocol/main/response_trait.h"
#include "protocol/main/void.h"
#include "protocol/main/user.h"
#include "protocol/main/get_user.h"
#include "protocol/main/tuple_test.h"

int main() {
    struct jsb_serializer_t s;
    struct jsb_deserializer_t d;
    assert(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
    
    {
        struct app_message_t value;
        assert(jsb_serializer_rewind(&s) == JSB_OK);
        assert(app_message_init(&value) == JSB_OK);
        assert(app_message_encode(&value, &s) == JSB_OK);
        assert(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        assert(app_message_decode(&d, &value) == JSB_OK);
        app_message_free(&value);
    }
    {
        struct app_command_move_forward_t value;
        assert(jsb_serializer_rewind(&s) == JSB_OK);
        assert(app_command_move_forward_init(&value) == JSB_OK);
        assert(app_command_move_forward_encode(&value, &s) == JSB_OK);
        assert(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        assert(app_command_move_forward_decode(&d, &value) == JSB_OK);
        app_command_move_forward_free(&value);
    }
    {
        struct app_command_move_backwards_t value;
        assert(jsb_serializer_rewind(&s) == JSB_OK);
        assert(app_command_move_backwards_init(&value) == JSB_OK);
        assert(app_command_move_backwards_encode(&value, &s) == JSB_OK);
        assert(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        assert(app_command_move_backwards_decode(&d, &value) == JSB_OK);
        app_command_move_backwards_free(&value);
    }
    {
        struct protocol_main_void_t value;
        assert(jsb_serializer_rewind(&s) == JSB_OK);
        assert(protocol_main_void_init(&value) == JSB_OK);
        assert(protocol_main_void_encode(&value, &s) == JSB_OK);
        assert(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        assert(protocol_main_void_decode(&d, &value) == JSB_OK);
        protocol_main_void_free(&value);
    }
    {
        struct protocol_main_user_t value;
        assert(jsb_serializer_rewind(&s) == JSB_OK);
        assert(protocol_main_user_init(&value) == JSB_OK);
        assert(protocol_main_user_encode(&value, &s) == JSB_OK);
        assert(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        assert(protocol_main_user_decode(&d, &value) == JSB_OK);
        protocol_main_user_free(&value);
    }
    {
        struct protocol_main_get_user_t value;
        assert(jsb_serializer_rewind(&s) == JSB_OK);
        assert(protocol_main_get_user_init(&value) == JSB_OK);
        assert(protocol_main_get_user_encode(&value, &s) == JSB_OK);
        assert(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        assert(protocol_main_get_user_decode(&d, &value) == JSB_OK);
        protocol_main_get_user_free(&value);
    }
    {
        struct protocol_main_tuple_test_t value;
        assert(jsb_serializer_rewind(&s) == JSB_OK);
        assert(protocol_main_tuple_test_init(&value) == JSB_OK);
        assert(protocol_main_tuple_test_encode(&value, &s) == JSB_OK);
        assert(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        assert(protocol_main_tuple_test_decode(&d, &value) == JSB_OK);
        protocol_main_tuple_test_free(&value);
    }
    
    jsb_serializer_free(&s);
    return 0;
}
