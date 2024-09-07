#ifndef IEEE754_H
#define IEEE754_H

#include <jsb/jsb.h>

enum jsb_result_t jsb_encode_float(jsb_uint8_t* buffer, float value);
enum jsb_result_t jsb_decode_float(const jsb_uint8_t* buffer, float* result);
enum jsb_result_t jsb_encode_double(jsb_uint8_t* buffer, double value);
enum jsb_result_t jsb_decode_double(const jsb_uint8_t* buffer, double* result);

#endif // IEEE754_H
