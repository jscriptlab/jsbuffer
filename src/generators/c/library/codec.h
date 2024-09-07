#ifdef __cplusplus
extern "C" {
#endif

#ifndef JSB_CODEC_H
#define JSB_CODEC_H

#include <jsb/jsb.h>

enum jsb_result_t jsb_encode_int8(jsb_uint8_t* buffer, const jsb_int8_t value);
enum jsb_result_t jsb_decode_int8(const jsb_uint8_t* buffer,
                                  jsb_int8_t* result);
enum jsb_result_t jsb_encode_int16(jsb_uint8_t* buffer,
                                   const jsb_int16_t value);
enum jsb_result_t jsb_decode_int16(const jsb_uint8_t* buffer,
                                   jsb_int16_t* result);
enum jsb_result_t jsb_encode_int32(jsb_uint8_t* buffer,
                                   const jsb_int32_t value);
enum jsb_result_t jsb_decode_int32(const jsb_uint8_t* buffer,
                                   jsb_int32_t* result);
enum jsb_result_t jsb_encode_int64(jsb_uint8_t* buffer,
                                   const jsb_int64_t value);
enum jsb_result_t jsb_decode_int64(const jsb_uint8_t* buffer,
                                   jsb_int64_t* result);
enum jsb_result_t jsb_encode_uint64(jsb_uint8_t* buffer,
                                    const jsb_uint64_t value);
enum jsb_result_t jsb_decode_uint64(const jsb_uint8_t* buffer,
                                    jsb_uint64_t* result);
enum jsb_result_t jsb_encode_uint32(jsb_uint8_t* buffer,
                                    const jsb_uint32_t value);
enum jsb_result_t jsb_decode_uint32(const jsb_uint8_t* buffer,
                                    jsb_uint32_t* result);
enum jsb_result_t jsb_encode_uint16(jsb_uint8_t* buffer,
                                    const jsb_uint16_t value);
enum jsb_result_t jsb_decode_uint16(const jsb_uint8_t* buffer,
                                    jsb_uint16_t* result);
enum jsb_result_t jsb_encode_uint8(jsb_uint8_t* buffer,
                                   const jsb_uint8_t value);
enum jsb_result_t jsb_decode_uint8(const jsb_uint8_t* buffer,
                                   jsb_uint8_t* result);

#endif
#ifdef __cplusplus
}
#endif
