#ifdef __AVR__
#include <avr/sleep.h>
#endif

#include <jsb/jsb.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

#include "simple_schema/user.h"
#include "simple_schema/post_trait.h"
#include "simple_schema/post_active.h"
#include "simple_schema/post_deleted.h"

#if !defined(__AVR__) && defined(FPRINTF_FOUND)
#include FPRINTF_HEADER

#define JSB_ASSERT(expr) \
  if((expr)) {} else { \
    fprintf(stderr, "%s:%d: Assertion failed: %s", __FILE__, __LINE__, #expr); \
    JSB_TRACE("test", "Assertion failed: %s", #expr); \
    return 1; \
  }
#else
#define JSB_ASSERT(expr) \
  if((expr)) {} else { \
    JSB_TRACE("test", "Assertion failed: %s", #expr); \
    return 1; \
  }
#endif // !defined(__AVR__) && defined(FPRINTF_FOUND)

int main(void) {
  struct jsb_serializer_t s;
  struct jsb_deserializer_t d;

  // It should return JSB_BAD_ARGUMENT if s is NULL
  JSB_ASSERT(jsb_serializer_init(NULL, 1) == JSB_BAD_ARGUMENT);

  // It should return JSB_BAD_ARGUMENT if buffer size is zero
  JSB_ASSERT(jsb_serializer_init(&s, 0) == JSB_BAD_ARGUMENT);

  // Initialize the serializer again in order to pass a valid buffer to the deserializer
  JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);

  // It should not return JSB_BAD_ARGUMENT if buffer size is zero
  JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);

  // It should return JSB_BAD_ARGUMENT if deserializer is NULL
  JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, s.buffer_size) == JSB_BAD_ARGUMENT);

  // It should return JSB_BAD_ARGUMENT if buffer is NULL
  JSB_ASSERT(jsb_deserializer_init(&d, NULL, s.buffer_size) == JSB_BAD_ARGUMENT);


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
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_uint16(&s, 0xFF);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_uint32(&s, 0xFFFF);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_uint64(&s, 0xFFFFFFFF);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_int8(&s, -1);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_int16(&s, -10);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_int32(&s, -100);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_int64(&s, -1000);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_float(&s, 0.12345678f);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
    }
    {
      JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
      do {
        status = jsb_serializer_write_double(&s, 0.1234567890);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
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
#error "Either JSB_SERIALIZER_BUFFER_SIZE or JSB_SERIALIZER_USE_MALLOC should be defined"
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)


  {
    struct simple_schema_user_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(simple_schema_user_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of the buffer
      enum jsb_result_t status;
      do {
        status = simple_schema_user_encode(&value, &s);
        status = simple_schema_user_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
    }
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    JSB_ASSERT(simple_schema_user_init(&value) == JSB_OK);
    JSB_ASSERT(simple_schema_user_encode(&value, &s) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
    JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
    JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
    JSB_ASSERT(simple_schema_user_decode(&d, &value) == JSB_OK);
    simple_schema_user_free(&value);
  }

  {
    struct simple_schema_user_t value;
    JSB_ASSERT(simple_schema_user_init(&value) == JSB_OK);
    value.id = 2147483647;
    JSB_ASSERT(simple_schema_user_last_post_init(&value, NULL) == JSB_OK);
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    JSB_ASSERT(simple_schema_user_encode(&value, &s) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
    JSB_ASSERT(simple_schema_user_decode(&d, &value) == JSB_OK);
    simple_schema_user_free(&value);
  }
  {
    struct simple_schema_post_trait_t value, new_value;
    // Initialize the type struct again
    jsb_memset(&value, 0, sizeof(value));
    JSB_ASSERT(simple_schema_post_trait_init(&value, SIMPLE_SCHEMA_POST_ACTIVE_TYPE) == JSB_OK);
    jsb_memset(&new_value, 0, sizeof(new_value));
    JSB_ASSERT(simple_schema_post_trait_init(&new_value, SIMPLE_SCHEMA_POST_ACTIVE_TYPE) == JSB_OK);
    /**
     * If we are not using dynamic memory allocation for the serializer
     * we need to make sure that we have enough memory left. To avoid inconclusive tests.
     */
#if !defined(JSB_SERIALIZER_USE_MALLOC)
    JSB_ASSERT(JSB_SERIALIZER_CALCULATE_REMAINING((&s)) >= sizeof(struct simple_schema_post_trait_t));
#endif // !defined(JSB_SERIALIZER_USE_MALLOC)
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
    JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
#else
    JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);
#endif
    JSB_ASSERT(simple_schema_post_trait_encode(&value, &s) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
    JSB_ASSERT(simple_schema_post_trait_decode(&d, &new_value) == JSB_OK);
    JSB_ASSERT(memcmp(&value, &new_value, sizeof(struct simple_schema_post_trait_t)) == JSB_OK);
  }
  {
    struct simple_schema_post_trait_t value, new_value;
    // Initialize the type struct again
    jsb_memset(&value, 0, sizeof(value));
    JSB_ASSERT(simple_schema_post_trait_init(&value, SIMPLE_SCHEMA_POST_ACTIVE_TYPE) == JSB_OK);
    jsb_memset(&new_value, 0, sizeof(new_value));
    JSB_ASSERT(simple_schema_post_trait_init(&new_value, SIMPLE_SCHEMA_POST_ACTIVE_TYPE) == JSB_OK);
    /**
     * If we are not using dynamic memory allocation for the serializer
     * we need to make sure that we have enough memory left. To avoid inconclusive tests.
     */
#if !defined(JSB_SERIALIZER_USE_MALLOC)
    JSB_ASSERT(JSB_SERIALIZER_CALCULATE_REMAINING((&s)) >= sizeof(struct simple_schema_post_trait_t));
#endif // !defined(JSB_SERIALIZER_USE_MALLOC)
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
    JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);
#else
    JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);
#endif
    JSB_ASSERT(simple_schema_post_trait_encode(&value, &s) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
    JSB_ASSERT(simple_schema_post_trait_decode(&d, &new_value) == JSB_OK);
    JSB_ASSERT(memcmp(&value, &new_value, sizeof(struct simple_schema_post_trait_t)) == JSB_OK);
  }
  {
    struct simple_schema_post_active_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(simple_schema_post_active_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of the buffer
      enum jsb_result_t status;
      do {
        status = simple_schema_post_active_encode(&value, &s);
        status = simple_schema_post_active_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
    }
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    JSB_ASSERT(simple_schema_post_active_init(&value) == JSB_OK);
    JSB_ASSERT(simple_schema_post_active_encode(&value, &s) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
    JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
    JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
    JSB_ASSERT(simple_schema_post_active_decode(&d, &value) == JSB_OK);
    simple_schema_post_active_free(&value);
  }

  {
    struct simple_schema_post_active_t value;
    JSB_ASSERT(simple_schema_post_active_init(&value) == JSB_OK);
    value.id = 2147483647;
    value.authorId = 2147483647;
    {
      jsb_uint8_t test_value[21] = "This is a test string";
      jsb_strncpy(value.title, test_value, 21);
    }
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    JSB_ASSERT(simple_schema_post_active_encode(&value, &s) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
    JSB_ASSERT(simple_schema_post_active_decode(&d, &value) == JSB_OK);
    simple_schema_post_active_free(&value);
  }
  {
    struct simple_schema_post_deleted_t value;
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    {
      JSB_ASSERT(simple_schema_post_deleted_init(&value) == JSB_OK);
#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
      // It should blow up when encoding a type is beyond the maximum size of the buffer
      enum jsb_result_t status;
      do {
        status = simple_schema_post_deleted_encode(&value, &s);
        status = simple_schema_post_deleted_encode(&value, &s);
        // If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.
        // Otherwise, some other issue has happened during execution.
        JSB_ASSERT(status == JSB_OK || status == JSB_BUFFER_OVERFLOW);
      } while(status != JSB_BUFFER_OVERFLOW);
#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)
    }
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    JSB_ASSERT(simple_schema_post_deleted_init(&value) == JSB_OK);
    JSB_ASSERT(simple_schema_post_deleted_encode(&value, &s) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);
    JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);
    JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);
    JSB_ASSERT(simple_schema_post_deleted_decode(&d, &value) == JSB_OK);
    simple_schema_post_deleted_free(&value);
  }

  {
    struct simple_schema_post_deleted_t value;
    JSB_ASSERT(simple_schema_post_deleted_init(&value) == JSB_OK);
    value.id = 2147483647;
    value.authorId = 2147483647;
    {
      jsb_uint8_t test_value[21] = "This is a test string";
      jsb_strncpy(value.title, test_value, 21);
    }
    JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);
    JSB_ASSERT(simple_schema_post_deleted_encode(&value, &s) == JSB_OK);
    JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);
    JSB_ASSERT(simple_schema_post_deleted_decode(&d, &value) == JSB_OK);
    simple_schema_post_deleted_free(&value);
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
