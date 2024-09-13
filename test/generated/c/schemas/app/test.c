#ifdef __AVR__
#include <avr/sleep.h>
#endif

#include <jsb/deserializer.h>
#include <jsb/jsb.h>
#include <jsb/serializer.h>

#include "app/command_move_backwards.h"
#include "app/command_move_forward.h"
#include "app/command_trait.h"
#include "app/message.h"
#include "protocol/main/get_user.h"
#include "protocol/main/request_trait.h"
#include "protocol/main/response_trait.h"
#include "protocol/main/tuple_test.h"
#include "protocol/main/user.h"
#include "protocol/main/void.h"

#define JSB_ASSERT(expr)                                                       \
  if ((expr)) {                                                                \
  } else {                                                                     \
    JSB_TRACE("test", "Assertion failed: %s", #expr);                          \
    return 1;                                                                  \
  }

int main(void) {
  struct jsb_serializer_t s;
  struct jsb_deserializer_t d;

  // It should return JSB_BAD_ARGUMENT if s is NULL
  JSB_ASSERT(jsb_serializer_init(NULL, 1) == JSB_BAD_ARGUMENT);

  // It should return JSB_BAD_ARGUMENT if buffer size is zero
  JSB_ASSERT(jsb_serializer_init(&s, 0) == JSB_BAD_ARGUMENT);

  // Initialize the serializer again in order to pass a valid buffer to the
  // deserializer
  JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);

  // It should not return JSB_BAD_ARGUMENT if buffer size is zero
  JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);

  // It should return JSB_BAD_ARGUMENT if deserializer is NULL
  JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, s.buffer_size) ==
             JSB_BAD_ARGUMENT);

  // It should return JSB_BAD_ARGUMENT if buffer is NULL
  JSB_ASSERT(jsb_deserializer_init(&d, NULL, s.buffer_size) ==
             JSB_BAD_ARGUMENT);

#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
  {
    // It should blow up if the serializer goes beyond the maximum size
    JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE + 1) ==
               JSB_BUFFER_OVERFLOW);
    JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
    enum jsb_result_t status;
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_uint8(&s, 1);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_uint16(&s, 0xFF);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_uint32(&s, 0xFFFF);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_uint64(&s, 0xFFFFFFFF);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_int8(&s, -1);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_int16(&s, -10);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_int32(&s, -100);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_int64(&s, -1000);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_float(&s, 0.12345678f);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_double(&s, 0.1234567890);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
    }
  }
#elif !defined(JSB_SERIALIZER_BUFFER_SIZE) && defined(JSB_SERIALIZER_USE_MALLOC)
  // It should reallocate the buffer when it goes beyond the maximum size
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_uint8(&s, 1) == JSB_OK);
    s.buffer_capacity = 1;
  }
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_uint16(&s, 0xFF) == JSB_OK);
    s.buffer_capacity = 1;
  }
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_uint32(&s, 0xFFFF) == JSB_OK);
    s.buffer_capacity = 1;
  }
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_uint64(&s, 0xFFFFFFFF) == JSB_OK);
    s.buffer_capacity = 1;
  }
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_int8(&s, -1) == JSB_OK);
    s.buffer_capacity = 1;
  }
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_int16(&s, -10) == JSB_OK);
    s.buffer_capacity = 1;
  }
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_int32(&s, -100) == JSB_OK);
    s.buffer_capacity = 1;
  }
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_int64(&s, -1000) == JSB_OK);
    s.buffer_capacity = 1;
  }
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_float(&s, 0.12345678f) == JSB_OK);
    s.buffer_capacity = 1;
  }
  {
    JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);
    JSB_ASSERT(jsb_serializer_write_double(&s, 0.1234567890) == JSB_OK);
    s.buffer_capacity = 1;
  }
#else
#error                                                                         \
    "Either JSB_SERIALIZER_BUFFER_SIZE or JSB_SERIALIZER_USE_MALLOC should be defined"
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) &&
       // !defined(JSB_SERIALIZER_USE_MALLOC)

  {
    struct app_message_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(app_message_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of
      // the buffer
      enum jsb_result_t status;
      do {
        status = app_message_encode(&value, &s);
        status = app_message_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) &&
       // !defined(JSB_SERIALIZER_USE_MALLOC)
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
      JSB_ASSERT(memcmp(&new_value.command, &value.command,
                        sizeof(value.command)) == 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "command");
    }
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
      JSB_ASSERT(memcmp(&new_value.command1, &value.command1,
                        sizeof(value.command1)) == 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "command1");
    }
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
      JSB_ASSERT(memcmp(&new_value.command2, &value.command2,
                        sizeof(value.command2)) == 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "command2");
    }
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
      JSB_ASSERT(memcmp(&new_value.command3, &value.command3,
                        sizeof(value.command3)) == 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "command3");
    }
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
      JSB_ASSERT(memcmp(&new_value.command4, &value.command4,
                        sizeof(value.command4)) == 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "command4");
    }
  }
  {
    struct app_command_move_forward_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(app_command_move_forward_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of
      // the buffer
      enum jsb_result_t status;
      do {
        status = app_command_move_forward_encode(&value, &s);
        status = app_command_move_forward_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) &&
       // !defined(JSB_SERIALIZER_USE_MALLOC)
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
      JSB_TRACE("test", "Test passed ✔ for param: %s", "stop");
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
      JSB_ASSERT(
          memcmp(&new_value.value2, &value.value2, sizeof(value.value2)) == 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "value2");
    }
  }
  {
    struct app_command_move_backwards_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(app_command_move_backwards_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of
      // the buffer
      enum jsb_result_t status;
      do {
        status = app_command_move_backwards_encode(&value, &s);
        status = app_command_move_backwards_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) &&
       // !defined(JSB_SERIALIZER_USE_MALLOC)
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
      JSB_TRACE("test", "Test passed ✔ for param: %s", "stop");
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
        strcpy((char*)value.value, (const char*)bytes);
        JSB_ASSERT(strcmp((const char*)value.value, (const char*)bytes) == 0);
      }
      JSB_ASSERT(app_command_move_backwards_encode(&value, &s) == JSB_OK);
      JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
      JSB_ASSERT(app_command_move_backwards_decode(&d, &new_value) == JSB_OK);
      JSB_ASSERT(memcmp(&new_value.value, &value.value, sizeof(value.value)) ==
                 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "value");
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
      JSB_ASSERT(
          memcmp(&new_value.value2, &value.value2, sizeof(value.value2)) == 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "value2");
    }
  }
  {
    {
      struct app_command_trait_t value, new_value;
      // Initialize the type struct again
      JSB_ASSERT(app_command_trait_init(
                     &value, APP_COMMAND_MOVE_FORWARD_TYPE) == JSB_OK);
      JSB_ASSERT(app_command_trait_init(
                     &new_value, APP_COMMAND_MOVE_FORWARD_TYPE) == JSB_OK);
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
#else
      JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);
#endif
      JSB_ASSERT(app_command_trait_encode(&value, &s) == JSB_OK);
      JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
      JSB_ASSERT(app_command_trait_decode(&d, &new_value) == JSB_OK);
      JSB_ASSERT(memcmp(&value, &new_value,
                        sizeof(struct app_command_trait_t)) == JSB_OK);
    }
    {
      struct app_command_trait_t value, new_value;
      // Initialize the type struct again
      JSB_ASSERT(app_command_trait_init(
                     &value, APP_COMMAND_MOVE_FORWARD_TYPE) == JSB_OK);
      JSB_ASSERT(app_command_trait_init(
                     &new_value, APP_COMMAND_MOVE_FORWARD_TYPE) == JSB_OK);
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
#else
      JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);
#endif
      JSB_ASSERT(app_command_trait_encode(&value, &s) == JSB_OK);
      JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
      JSB_ASSERT(app_command_trait_decode(&d, &new_value) == JSB_OK);
      JSB_ASSERT(memcmp(&value, &new_value,
                        sizeof(struct app_command_trait_t)) == JSB_OK);
    }
  }
  {
    {
      struct protocol_main_request_trait_t value, new_value;
      // Initialize the type struct again
      JSB_ASSERT(protocol_main_request_trait_init(
                     &value, PROTOCOL_MAIN_GET_USER_TYPE) == JSB_OK);
      JSB_ASSERT(protocol_main_request_trait_init(
                     &new_value, PROTOCOL_MAIN_GET_USER_TYPE) == JSB_OK);
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
#else
      JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);
#endif
      JSB_ASSERT(protocol_main_request_trait_encode(&value, &s) == JSB_OK);
      JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
      JSB_ASSERT(protocol_main_request_trait_decode(&d, &new_value) == JSB_OK);
      JSB_ASSERT(memcmp(&value, &new_value,
                        sizeof(struct protocol_main_request_trait_t)) ==
                 JSB_OK);
    }
  }
  {
    {
      struct protocol_main_response_trait_t value, new_value;
      // Initialize the type struct again
      JSB_ASSERT(protocol_main_response_trait_init(
                     &value, PROTOCOL_MAIN_VOID_TYPE) == JSB_OK);
      JSB_ASSERT(protocol_main_response_trait_init(
                     &new_value, PROTOCOL_MAIN_VOID_TYPE) == JSB_OK);
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
#else
      JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);
#endif
      JSB_ASSERT(protocol_main_response_trait_encode(&value, &s) == JSB_OK);
      JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
      JSB_ASSERT(protocol_main_response_trait_decode(&d, &new_value) == JSB_OK);
      JSB_ASSERT(memcmp(&value, &new_value,
                        sizeof(struct protocol_main_response_trait_t)) ==
                 JSB_OK);
    }
    {
      struct protocol_main_response_trait_t value, new_value;
      // Initialize the type struct again
      JSB_ASSERT(protocol_main_response_trait_init(
                     &value, PROTOCOL_MAIN_VOID_TYPE) == JSB_OK);
      JSB_ASSERT(protocol_main_response_trait_init(
                     &new_value, PROTOCOL_MAIN_VOID_TYPE) == JSB_OK);
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
#else
      JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);
#endif
      JSB_ASSERT(protocol_main_response_trait_encode(&value, &s) == JSB_OK);
      JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
      JSB_ASSERT(protocol_main_response_trait_decode(&d, &new_value) == JSB_OK);
      JSB_ASSERT(memcmp(&value, &new_value,
                        sizeof(struct protocol_main_response_trait_t)) ==
                 JSB_OK);
    }
  }
  {
    struct protocol_main_void_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(protocol_main_void_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of
      // the buffer
      enum jsb_result_t status;
      do {
        status = protocol_main_void_encode(&value, &s);
        status = protocol_main_void_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) &&
       // !defined(JSB_SERIALIZER_USE_MALLOC)
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
      JSB_ASSERT(memcmp(&new_value.value, &value.value, sizeof(value.value)) ==
                 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "value");
    }
  }
  {
    struct protocol_main_user_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(protocol_main_user_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of
      // the buffer
      enum jsb_result_t status;
      do {
        status = protocol_main_user_encode(&value, &s);
        status = protocol_main_user_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) &&
       // !defined(JSB_SERIALIZER_USE_MALLOC)
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
      JSB_TRACE("test", "Test passed ✔ for param: %s", "id");
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
      JSB_TRACE("test", "Test passed ✔ for param: %s", "name");
    }
  }
  {
    struct protocol_main_get_user_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(protocol_main_get_user_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of
      // the buffer
      enum jsb_result_t status;
      do {
        status = protocol_main_get_user_encode(&value, &s);
        status = protocol_main_get_user_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) &&
       // !defined(JSB_SERIALIZER_USE_MALLOC)
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
      JSB_TRACE("test", "Test passed ✔ for param: %s", "id");
    }
  }
  {
    struct protocol_main_tuple_test_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(protocol_main_tuple_test_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of
      // the buffer
      enum jsb_result_t status;
      do {
        status = protocol_main_tuple_test_encode(&value, &s);
        status = protocol_main_tuple_test_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while (status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) &&
       // !defined(JSB_SERIALIZER_USE_MALLOC)
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
      value.values.item_2    = 2147483647;
      value.values.item_3.id = 2147483647;
      strcpy((char*)value.values.item_3.name, "Test string");
      value.values.item_4.value = 2147483647;
      value.values.item_5       = 65535;
      value.values.item_6       = 4294967295;
      value.values.item_7       = 32767;
      value.values.item_8       = 127;
      value.values.item_9       = 255;
      JSB_ASSERT(protocol_main_tuple_test_encode(&value, &s) == JSB_OK);
      JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
      JSB_ASSERT(protocol_main_tuple_test_decode(&d, &new_value) == JSB_OK);
      JSB_ASSERT(
          memcmp(&new_value.values, &value.values, sizeof(value.values)) == 0);
      JSB_TRACE("test", "Test passed ✔ for param: %s", "values");
    }
  }

  jsb_serializer_free(&s);

  JSB_TRACE("test", "All tests passed ✔");

#ifdef __AVR__
  // Put AVR MCUs to sleep
  // Note: `asm("sleep")` would also work
  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
  sleep_mode();
#endif

  return 0;
}