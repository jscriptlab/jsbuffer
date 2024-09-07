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

#define JSB_ASSERT(expr) \
    if((expr)) {} else { \
        fprintf(stderr, "%s:%d: Assertion failed: %s\n", __FILE__, __LINE__, #expr); \
        return 1; \
    }

int main() {
    struct jsb_serializer_t s;
    struct jsb_deserializer_t d;
    JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
    JSB_ASSERT(jsb_serializer_init(NULL, JSB_SERIALIZER_BUFFER_SIZE) == JSB_BAD_ARGUMENT);
    
    
    #if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
    {
        // It should blow up if the serializer goes beyond the maximum size
        JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE + 1) == JSB_BUFFER_OVERFLOW);
        JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
        enum jsb_result_t status;
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_uint8(&s, 1);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_uint16(&s, 0xFF);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_uint32(&s, 0xFFFF);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_uint64(&s, 0xFFFFFFFF);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_int8(&s, -1);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_int16(&s, -10);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_int32(&s, -100);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_int64(&s, -1000);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_float(&s, 0.12345678f);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
        {
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            do {
                status = jsb_serializer_write_double(&s, 0.1234567890);
            } while(status != JSB_BUFFER_OVERFLOW);
        }
    }
    #endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
    
    
    {
        struct app_message_t value;
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        {
            JSB_ASSERT(app_message_init(&value) == JSB_OK);
            #if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
            // It should blow up when encoding a type is beyond the maximum size of the buffer
            enum jsb_result_t status;
            do {
                status = app_message_encode(&value, &s);
                status = app_message_encode(&value, &s);
            } while(status != JSB_BUFFER_OVERFLOW);
            #endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
        }
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        JSB_ASSERT(app_message_init(&value) == JSB_OK);
        JSB_ASSERT(app_message_encode(&value, &s) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(app_message_decode(&d, &value) == JSB_OK);
        app_message_free(&value);
        
        {
            struct app_message_t new_value;
            memset(&new_value, 0, sizeof(struct app_message_t));
            memset(&value, 0, sizeof(struct app_message_t));
            JSB_ASSERT(app_message_init(&value) == JSB_OK);
            JSB_ASSERT(app_message_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            JSB_ASSERT(app_message_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(app_message_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.command, &value.command, sizeof(value.command)) == 0);
            printf("Test passed for command ✔\n");
        }
    }
    {
        struct app_command_move_forward_t value;
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        {
            JSB_ASSERT(app_command_move_forward_init(&value) == JSB_OK);
            #if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
            // It should blow up when encoding a type is beyond the maximum size of the buffer
            enum jsb_result_t status;
            do {
                status = app_command_move_forward_encode(&value, &s);
                status = app_command_move_forward_encode(&value, &s);
            } while(status != JSB_BUFFER_OVERFLOW);
            #endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
        }
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        JSB_ASSERT(app_command_move_forward_init(&value) == JSB_OK);
        JSB_ASSERT(app_command_move_forward_encode(&value, &s) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(app_command_move_forward_decode(&d, &value) == JSB_OK);
        app_command_move_forward_free(&value);
        
        {
            struct app_command_move_forward_t new_value;
            memset(&new_value, 0, sizeof(struct app_command_move_forward_t));
            memset(&value, 0, sizeof(struct app_command_move_forward_t));
            JSB_ASSERT(app_command_move_forward_init(&value) == JSB_OK);
            JSB_ASSERT(app_command_move_forward_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            value.stop = true;
            JSB_ASSERT(app_command_move_forward_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(app_command_move_forward_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.stop, &value.stop, sizeof(value.stop)) == 0);
            printf("Test passed for stop ✔\n");
        }
        {
            struct app_command_move_forward_t new_value;
            memset(&new_value, 0, sizeof(struct app_command_move_forward_t));
            memset(&value, 0, sizeof(struct app_command_move_forward_t));
            JSB_ASSERT(app_command_move_forward_init(&value) == JSB_OK);
            JSB_ASSERT(app_command_move_forward_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            value.value2 = 0.1234567890;
            JSB_ASSERT(app_command_move_forward_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(app_command_move_forward_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.value2, &value.value2, sizeof(value.value2)) == 0);
            printf("Test passed for value2 ✔\n");
        }
    }
    {
        struct app_command_move_backwards_t value;
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        {
            JSB_ASSERT(app_command_move_backwards_init(&value) == JSB_OK);
            #if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
            // It should blow up when encoding a type is beyond the maximum size of the buffer
            enum jsb_result_t status;
            do {
                status = app_command_move_backwards_encode(&value, &s);
                status = app_command_move_backwards_encode(&value, &s);
            } while(status != JSB_BUFFER_OVERFLOW);
            #endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
        }
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        JSB_ASSERT(app_command_move_backwards_init(&value) == JSB_OK);
        JSB_ASSERT(app_command_move_backwards_encode(&value, &s) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(app_command_move_backwards_decode(&d, &value) == JSB_OK);
        app_command_move_backwards_free(&value);
        
        {
            struct app_command_move_backwards_t new_value;
            memset(&new_value, 0, sizeof(struct app_command_move_backwards_t));
            memset(&value, 0, sizeof(struct app_command_move_backwards_t));
            JSB_ASSERT(app_command_move_backwards_init(&value) == JSB_OK);
            JSB_ASSERT(app_command_move_backwards_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            value.stop = true;
            JSB_ASSERT(app_command_move_backwards_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(app_command_move_backwards_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.stop, &value.stop, sizeof(value.stop)) == 0);
            printf("Test passed for stop ✔\n");
        }
        {
            struct app_command_move_backwards_t new_value;
            memset(&new_value, 0, sizeof(struct app_command_move_backwards_t));
            memset(&value, 0, sizeof(struct app_command_move_backwards_t));
            JSB_ASSERT(app_command_move_backwards_init(&value) == JSB_OK);
            JSB_ASSERT(app_command_move_backwards_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            {
                const jsb_uint8_t bytes[1] = {0};
                strcpy((char*)value.value, (const char *) bytes);
            }
            JSB_ASSERT(app_command_move_backwards_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(app_command_move_backwards_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.value, &value.value, sizeof(value.value)) == 0);
            printf("Test passed for value ✔\n");
        }
        {
            struct app_command_move_backwards_t new_value;
            memset(&new_value, 0, sizeof(struct app_command_move_backwards_t));
            memset(&value, 0, sizeof(struct app_command_move_backwards_t));
            JSB_ASSERT(app_command_move_backwards_init(&value) == JSB_OK);
            JSB_ASSERT(app_command_move_backwards_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            value.value2 = 0.12345678f;
            JSB_ASSERT(app_command_move_backwards_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(app_command_move_backwards_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.value2, &value.value2, sizeof(value.value2)) == 0);
            printf("Test passed for value2 ✔\n");
        }
    }
    {
        {
            struct app_command_trait_t value, new_value;
            // Initialize the type struct again
            JSB_ASSERT(app_command_trait_init(&value, APP_COMMAND_MOVE_FORWARD_TYPE) == JSB_OK);
            JSB_ASSERT(app_command_trait_init(&new_value, APP_COMMAND_MOVE_FORWARD_TYPE) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
            JSB_ASSERT(app_command_trait_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(app_command_trait_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&value, &new_value, sizeof(struct app_command_trait_t)) == JSB_OK);
        }
        {
            struct app_command_trait_t value, new_value;
            // Initialize the type struct again
            JSB_ASSERT(app_command_trait_init(&value, APP_COMMAND_MOVE_FORWARD_TYPE) == JSB_OK);
            JSB_ASSERT(app_command_trait_init(&new_value, APP_COMMAND_MOVE_FORWARD_TYPE) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
            JSB_ASSERT(app_command_trait_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(app_command_trait_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&value, &new_value, sizeof(struct app_command_trait_t)) == JSB_OK);
        }
    }
    {
        {
            struct protocol_main_request_trait_t value, new_value;
            // Initialize the type struct again
            JSB_ASSERT(protocol_main_request_trait_init(&value, PROTOCOL_MAIN_GET_USER_TYPE) == JSB_OK);
            JSB_ASSERT(protocol_main_request_trait_init(&new_value, PROTOCOL_MAIN_GET_USER_TYPE) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
            JSB_ASSERT(protocol_main_request_trait_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(protocol_main_request_trait_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&value, &new_value, sizeof(struct protocol_main_request_trait_t)) == JSB_OK);
        }
    }
    {
        {
            struct protocol_main_response_trait_t value, new_value;
            // Initialize the type struct again
            JSB_ASSERT(protocol_main_response_trait_init(&value, PROTOCOL_MAIN_VOID_TYPE) == JSB_OK);
            JSB_ASSERT(protocol_main_response_trait_init(&new_value, PROTOCOL_MAIN_VOID_TYPE) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
            JSB_ASSERT(protocol_main_response_trait_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(protocol_main_response_trait_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&value, &new_value, sizeof(struct protocol_main_response_trait_t)) == JSB_OK);
        }
        {
            struct protocol_main_response_trait_t value, new_value;
            // Initialize the type struct again
            JSB_ASSERT(protocol_main_response_trait_init(&value, PROTOCOL_MAIN_VOID_TYPE) == JSB_OK);
            JSB_ASSERT(protocol_main_response_trait_init(&new_value, PROTOCOL_MAIN_VOID_TYPE) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
            JSB_ASSERT(protocol_main_response_trait_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(protocol_main_response_trait_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&value, &new_value, sizeof(struct protocol_main_response_trait_t)) == JSB_OK);
        }
    }
    {
        struct protocol_main_void_t value;
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        {
            JSB_ASSERT(protocol_main_void_init(&value) == JSB_OK);
            #if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
            // It should blow up when encoding a type is beyond the maximum size of the buffer
            enum jsb_result_t status;
            do {
                status = protocol_main_void_encode(&value, &s);
                status = protocol_main_void_encode(&value, &s);
            } while(status != JSB_BUFFER_OVERFLOW);
            #endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
        }
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        JSB_ASSERT(protocol_main_void_init(&value) == JSB_OK);
        JSB_ASSERT(protocol_main_void_encode(&value, &s) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(protocol_main_void_decode(&d, &value) == JSB_OK);
        protocol_main_void_free(&value);
        
        {
            struct protocol_main_void_t new_value;
            memset(&new_value, 0, sizeof(struct protocol_main_void_t));
            memset(&value, 0, sizeof(struct protocol_main_void_t));
            JSB_ASSERT(protocol_main_void_init(&value) == JSB_OK);
            JSB_ASSERT(protocol_main_void_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            value.value = 2147483647;
            JSB_ASSERT(protocol_main_void_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(protocol_main_void_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.value, &value.value, sizeof(value.value)) == 0);
            printf("Test passed for value ✔\n");
        }
    }
    {
        struct protocol_main_user_t value;
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        {
            JSB_ASSERT(protocol_main_user_init(&value) == JSB_OK);
            #if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
            // It should blow up when encoding a type is beyond the maximum size of the buffer
            enum jsb_result_t status;
            do {
                status = protocol_main_user_encode(&value, &s);
                status = protocol_main_user_encode(&value, &s);
            } while(status != JSB_BUFFER_OVERFLOW);
            #endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
        }
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        JSB_ASSERT(protocol_main_user_init(&value) == JSB_OK);
        JSB_ASSERT(protocol_main_user_encode(&value, &s) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(protocol_main_user_decode(&d, &value) == JSB_OK);
        protocol_main_user_free(&value);
        
        {
            struct protocol_main_user_t new_value;
            memset(&new_value, 0, sizeof(struct protocol_main_user_t));
            memset(&value, 0, sizeof(struct protocol_main_user_t));
            JSB_ASSERT(protocol_main_user_init(&value) == JSB_OK);
            JSB_ASSERT(protocol_main_user_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            value.id = 2147483647;
            JSB_ASSERT(protocol_main_user_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(protocol_main_user_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.id, &value.id, sizeof(value.id)) == 0);
            printf("Test passed for id ✔\n");
        }
        {
            struct protocol_main_user_t new_value;
            memset(&new_value, 0, sizeof(struct protocol_main_user_t));
            memset(&value, 0, sizeof(struct protocol_main_user_t));
            JSB_ASSERT(protocol_main_user_init(&value) == JSB_OK);
            JSB_ASSERT(protocol_main_user_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            strcpy((char*)value.name, "Test string");
            JSB_ASSERT(protocol_main_user_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(protocol_main_user_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.name, &value.name, sizeof(value.name)) == 0);
            printf("Test passed for name ✔\n");
        }
    }
    {
        struct protocol_main_get_user_t value;
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        {
            JSB_ASSERT(protocol_main_get_user_init(&value) == JSB_OK);
            #if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
            // It should blow up when encoding a type is beyond the maximum size of the buffer
            enum jsb_result_t status;
            do {
                status = protocol_main_get_user_encode(&value, &s);
                status = protocol_main_get_user_encode(&value, &s);
            } while(status != JSB_BUFFER_OVERFLOW);
            #endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
        }
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        JSB_ASSERT(protocol_main_get_user_init(&value) == JSB_OK);
        JSB_ASSERT(protocol_main_get_user_encode(&value, &s) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(protocol_main_get_user_decode(&d, &value) == JSB_OK);
        protocol_main_get_user_free(&value);
        
        {
            struct protocol_main_get_user_t new_value;
            memset(&new_value, 0, sizeof(struct protocol_main_get_user_t));
            memset(&value, 0, sizeof(struct protocol_main_get_user_t));
            JSB_ASSERT(protocol_main_get_user_init(&value) == JSB_OK);
            JSB_ASSERT(protocol_main_get_user_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            value.id = 2147483647;
            JSB_ASSERT(protocol_main_get_user_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(protocol_main_get_user_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.id, &value.id, sizeof(value.id)) == 0);
            printf("Test passed for id ✔\n");
        }
    }
    {
        struct protocol_main_tuple_test_t value;
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        {
            JSB_ASSERT(protocol_main_tuple_test_init(&value) == JSB_OK);
            #if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
            // It should blow up when encoding a type is beyond the maximum size of the buffer
            enum jsb_result_t status;
            do {
                status = protocol_main_tuple_test_encode(&value, &s);
                status = protocol_main_tuple_test_encode(&value, &s);
            } while(status != JSB_BUFFER_OVERFLOW);
            #endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
        }
        JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
        JSB_ASSERT(protocol_main_tuple_test_init(&value) == JSB_OK);
        JSB_ASSERT(protocol_main_tuple_test_encode(&value, &s) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
        JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
        JSB_ASSERT(protocol_main_tuple_test_decode(&d, &value) == JSB_OK);
        protocol_main_tuple_test_free(&value);
        
        {
            struct protocol_main_tuple_test_t new_value;
            memset(&new_value, 0, sizeof(struct protocol_main_tuple_test_t));
            memset(&value, 0, sizeof(struct protocol_main_tuple_test_t));
            JSB_ASSERT(protocol_main_tuple_test_init(&value) == JSB_OK);
            JSB_ASSERT(protocol_main_tuple_test_init(&new_value) == JSB_OK);
            JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
            value.values.item_0 = 2147483647;
            strcpy((char*)value.values.item_1, "Test string");
            value.values.item_2 = 2147483647;
            value.values.item_3.id = 2147483647;
            strcpy((char*)value.values.item_3.name, "Test string");
            value.values.item_4.value = 2147483647;
            value.values.item_5 = 65535;
            value.values.item_6 = 4294967295;
            value.values.item_7 = 32767;
            value.values.item_8 = 127;
            value.values.item_9 = 255;
            JSB_ASSERT(protocol_main_tuple_test_encode(&value, &s) == JSB_OK);
            JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
            JSB_ASSERT(protocol_main_tuple_test_decode(&d, &new_value) == JSB_OK);
            JSB_ASSERT(memcmp(&new_value.values, &value.values, sizeof(value.values)) == 0);
            printf("Test passed for values ✔\n");
        }
    }
    
    jsb_serializer_free(&s);
    return 0;
}
