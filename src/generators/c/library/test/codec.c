#include "../codec.h"
#include "rand.h"
#include "test.h"

#include <jsb/ieee754.h>

#ifdef __AVR__
#include <avr/sleep.h>
#define JSB_CODEC_TEST_ITERATION_COUNT 10
#else
#define JSB_CODEC_TEST_ITERATION_COUNT 1000
#endif

int main(void) {
  jsb_uint32_t i;

  rand_init();

  {
    jsb_uint8_t buffer[1];
    jsb_int8_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill(&output, sizeof(jsb_int8_t));
      ASSERT_JSB_OK(jsb_encode_int8(buffer, output));
      ASSERT_JSB_OK(jsb_decode_int8(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
  {
    jsb_uint8_t buffer[2];
    jsb_int16_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill(&output, sizeof(jsb_int16_t));
      ASSERT_JSB_OK(jsb_encode_int16(buffer, output));
      ASSERT_JSB_OK(jsb_decode_int16(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
  {
    jsb_uint8_t buffer[4];
    jsb_int32_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill(&output, sizeof(jsb_int32_t));
      ASSERT_JSB_OK(jsb_encode_int32(buffer, output));
      ASSERT_JSB_OK(jsb_decode_int32(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
  {
    jsb_uint8_t buffer[8];
    jsb_int64_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill(&output, sizeof(jsb_int64_t));
      ASSERT_JSB_OK(jsb_encode_int64(buffer, output));
      ASSERT_JSB_OK(jsb_decode_int64(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
  {
    jsb_uint8_t buffer[8];
    jsb_uint64_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill(&output, sizeof(jsb_uint64_t));
      ASSERT_JSB_OK(jsb_encode_uint64(buffer, output));
      ASSERT_JSB_OK(jsb_decode_uint64(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
  {
    jsb_uint8_t buffer[4];
    jsb_uint32_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill(&output, sizeof(jsb_uint32_t));
      ASSERT_JSB_OK(jsb_encode_uint32(buffer, output));
      ASSERT_JSB_OK(jsb_decode_uint32(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
  {
    jsb_uint8_t buffer[2];
    jsb_uint16_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill(&output, sizeof(jsb_uint16_t));
      ASSERT_JSB_OK(jsb_encode_uint16(buffer, output));
      ASSERT_JSB_OK(jsb_decode_uint16(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
  {
    jsb_uint8_t buffer[1];
    jsb_uint8_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill(&output, sizeof(jsb_uint8_t));
      ASSERT_JSB_OK(jsb_encode_uint8(buffer, output));
      ASSERT_JSB_OK(jsb_decode_uint8(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
  {
    jsb_uint8_t buffer[4];
    jsb_float_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill_float(&output, 1);
      ASSERT_JSB_OK(jsb_encode_float(buffer, output));
      ASSERT_JSB_OK(jsb_decode_float(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
  {
    jsb_uint8_t buffer[8];
    jsb_double_t output, decoded_value;
    for (i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {
      rand_fill_double(&output, 1);
      ASSERT_JSB_OK(jsb_encode_double(buffer, output));
      ASSERT_JSB_OK(jsb_decode_double(buffer, &decoded_value));
      ASSERT_JSB(decoded_value == output);
    }
  }
#ifdef __AVR__
  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
  sleep_mode();
#endif
  return 0;
}
