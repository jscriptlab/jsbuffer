#include <jsb/ieee754.h>
#include <jsb/jsb.h>

#define FLOAT_SIGN_MASK 0x80000000
#define FLOAT_EXP_MASK 0x7F800000
#define FLOAT_FRAC_MASK 0x007FFFFF
#define DOUBLE_SIGN_MASK 0x8000000000000000ULL
#define DOUBLE_EXP_MASK 0x7FF0000000000000ULL
#define DOUBLE_FRAC_MASK 0x000FFFFFFFFFFFFFULL

enum jsb_result_t jsb_encode_float(jsb_uint8_t* buffer,
                                   const jsb_float_t value) {
  if (!buffer) {
    return JSB_BAD_ARGUMENT;
  }

  jsb_uint32_t bits;
  jsb_memcpy(&bits, &value, sizeof(jsb_float_t)); // Copy float bits

  // Store 32-bit float in 4 bytes
  buffer[0] = (bits >> 24) & 0xFF; // Most significant byte
  buffer[1] = (bits >> 16) & 0xFF;
  buffer[2] = (bits >> 8) & 0xFF;
  buffer[3] = bits & 0xFF; // Least significant byte

  return JSB_OK;
}

enum jsb_result_t jsb_decode_float(const jsb_uint8_t* buffer,
                                   jsb_float_t* result) {
  if (!buffer || !result) {
    return JSB_BAD_ARGUMENT;
  }

  // Reconstruct 32-bit float from 4 bytes
  const jsb_uint32_t bits =
      ((jsb_uint32_t)buffer[0] << 24) | ((jsb_uint32_t)buffer[1] << 16) |
      ((jsb_uint32_t)buffer[2] << 8) | (jsb_uint32_t)buffer[3];

  jsb_memcpy(result, &bits, sizeof(jsb_float_t));

  return JSB_OK;
}

enum jsb_result_t jsb_encode_double(jsb_uint8_t* buffer,
                                    const jsb_double_t value) {
  if (!buffer) {
    return JSB_BAD_ARGUMENT;
  }

  jsb_uint64_t bits;
  jsb_memcpy(&bits, &value, sizeof(jsb_double_t)); // Copy double bits

  const jsb_uint8_t sign      = (bits >> 63) & 0x1;   // Extract sign bit
  const jsb_uint16_t exponent = (bits >> 52) & 0x7FF; // Extract exponent bits
  const jsb_uint64_t mantissa =
      bits & DOUBLE_FRAC_MASK; // Extract mantissa bits

  buffer[0] = (sign << 7) |
              ((exponent >> 4) & 0x7F); // Combine sign and part of exponent
  buffer[1] = ((exponent & 0x0F) << 4) |
              ((mantissa >> 48) &
               0x0F); // Combine remaining exponent and part of mantissa
  buffer[2] = (mantissa >> 40) & 0xFF;
  buffer[3] = (mantissa >> 32) & 0xFF;
  buffer[4] = (mantissa >> 24) & 0xFF;
  buffer[5] = (mantissa >> 16) & 0xFF;
  buffer[6] = (mantissa >> 8) & 0xFF;
  buffer[7] = mantissa & 0xFF;

  return JSB_OK;
}

enum jsb_result_t jsb_decode_double(const jsb_uint8_t* buffer,
                                    jsb_double_t* result) {
  if (!buffer || !result) {
    return JSB_BAD_ARGUMENT;
  }

  const jsb_uint64_t sign =
      (jsb_uint64_t)(buffer[0] >> 7) & 0x1; // Extract sign bit
  const jsb_uint64_t exponent =
      ((jsb_uint64_t)(buffer[0] & 0x7F) << 4) |
      ((jsb_uint64_t)(buffer[1] >> 4) & 0x0F); // Extract exponent bits
  const jsb_uint64_t mantissa =
      ((jsb_uint64_t)(buffer[1] & 0x0F) << 48) |
      ((jsb_uint64_t)buffer[2] << 40) | ((jsb_uint64_t)buffer[3] << 32) |
      ((jsb_uint64_t)buffer[4] << 24) | ((jsb_uint64_t)buffer[5] << 16) |
      ((jsb_uint64_t)buffer[6] << 8) | (jsb_uint64_t)buffer[7];

  const jsb_uint64_t double_bits = (sign << 63) | (exponent << 52) | mantissa;
  jsb_memcpy(result, &double_bits, sizeof(jsb_double_t));

  return JSB_OK;
}
