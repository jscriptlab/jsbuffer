#include "codec.h"

enum jsb_result_t jsb_encode_int8(jsb_uint8_t* buffer, const jsb_int8_t value) {
    buffer[0] = (value >> 0) & 0xFF;
    return JSB_OK;
}

enum jsb_result_t jsb_decode_int8(const jsb_uint8_t* buffer, jsb_int8_t* result) {
    *result = 0;
    *result |= (jsb_int8_t)(buffer[0]) << 0;
    return JSB_OK;
}
enum jsb_result_t jsb_encode_int16(jsb_uint8_t* buffer, const jsb_int16_t value) {
    buffer[1] = (value >> 8) & 0xFF;
    buffer[0] = (value >> 0) & 0xFF;
    return JSB_OK;
}

enum jsb_result_t jsb_decode_int16(const jsb_uint8_t* buffer, jsb_int16_t* result) {
    *result = 0;
    *result |= (jsb_int16_t)(buffer[1]) << 8;
    *result |= (jsb_int16_t)(buffer[0]) << 0;
    return JSB_OK;
}
enum jsb_result_t jsb_encode_int32(jsb_uint8_t* buffer, const jsb_int32_t value) {
    buffer[3] = (value >> 24) & 0xFF;
    buffer[2] = (value >> 16) & 0xFF;
    buffer[1] = (value >> 8) & 0xFF;
    buffer[0] = (value >> 0) & 0xFF;
    return JSB_OK;
}

enum jsb_result_t jsb_decode_int32(const jsb_uint8_t* buffer, jsb_int32_t* result) {
    *result = 0;
    *result |= (jsb_int32_t)(buffer[3]) << 24;
    *result |= (jsb_int32_t)(buffer[2]) << 16;
    *result |= (jsb_int32_t)(buffer[1]) << 8;
    *result |= (jsb_int32_t)(buffer[0]) << 0;
    return JSB_OK;
}
enum jsb_result_t jsb_encode_int64(jsb_uint8_t* buffer, const jsb_int64_t value) {
    buffer[7] = (value >> 56) & 0xFF;
    buffer[6] = (value >> 48) & 0xFF;
    buffer[5] = (value >> 40) & 0xFF;
    buffer[4] = (value >> 32) & 0xFF;
    buffer[3] = (value >> 24) & 0xFF;
    buffer[2] = (value >> 16) & 0xFF;
    buffer[1] = (value >> 8) & 0xFF;
    buffer[0] = (value >> 0) & 0xFF;
    return JSB_OK;
}

enum jsb_result_t jsb_decode_int64(const jsb_uint8_t* buffer, jsb_int64_t* result) {
    *result = 0;
    *result |= (jsb_int64_t)(buffer[7]) << 56;
    *result |= (jsb_int64_t)(buffer[6]) << 48;
    *result |= (jsb_int64_t)(buffer[5]) << 40;
    *result |= (jsb_int64_t)(buffer[4]) << 32;
    *result |= (jsb_int64_t)(buffer[3]) << 24;
    *result |= (jsb_int64_t)(buffer[2]) << 16;
    *result |= (jsb_int64_t)(buffer[1]) << 8;
    *result |= (jsb_int64_t)(buffer[0]) << 0;
    return JSB_OK;
}
enum jsb_result_t jsb_encode_uint64(jsb_uint8_t* buffer, const jsb_uint64_t value) {
    buffer[7] = (value >> 56) & 0xFF;
    buffer[6] = (value >> 48) & 0xFF;
    buffer[5] = (value >> 40) & 0xFF;
    buffer[4] = (value >> 32) & 0xFF;
    buffer[3] = (value >> 24) & 0xFF;
    buffer[2] = (value >> 16) & 0xFF;
    buffer[1] = (value >> 8) & 0xFF;
    buffer[0] = (value >> 0) & 0xFF;
    return JSB_OK;
}

enum jsb_result_t jsb_decode_uint64(const jsb_uint8_t* buffer, jsb_uint64_t* result) {
    *result = 0;
    *result |= (jsb_uint64_t)(buffer[7]) << 56;
    *result |= (jsb_uint64_t)(buffer[6]) << 48;
    *result |= (jsb_uint64_t)(buffer[5]) << 40;
    *result |= (jsb_uint64_t)(buffer[4]) << 32;
    *result |= (jsb_uint64_t)(buffer[3]) << 24;
    *result |= (jsb_uint64_t)(buffer[2]) << 16;
    *result |= (jsb_uint64_t)(buffer[1]) << 8;
    *result |= (jsb_uint64_t)(buffer[0]) << 0;
    return JSB_OK;
}
enum jsb_result_t jsb_encode_uint32(jsb_uint8_t* buffer, const jsb_uint32_t value) {
    buffer[3] = (value >> 24) & 0xFF;
    buffer[2] = (value >> 16) & 0xFF;
    buffer[1] = (value >> 8) & 0xFF;
    buffer[0] = (value >> 0) & 0xFF;
    return JSB_OK;
}

enum jsb_result_t jsb_decode_uint32(const jsb_uint8_t* buffer, jsb_uint32_t* result) {
    *result = 0;
    *result |= (jsb_uint32_t)(buffer[3]) << 24;
    *result |= (jsb_uint32_t)(buffer[2]) << 16;
    *result |= (jsb_uint32_t)(buffer[1]) << 8;
    *result |= (jsb_uint32_t)(buffer[0]) << 0;
    return JSB_OK;
}
enum jsb_result_t jsb_encode_uint16(jsb_uint8_t* buffer, const jsb_uint16_t value) {
    buffer[1] = (value >> 8) & 0xFF;
    buffer[0] = (value >> 0) & 0xFF;
    return JSB_OK;
}

enum jsb_result_t jsb_decode_uint16(const jsb_uint8_t* buffer, jsb_uint16_t* result) {
    *result = 0;
    *result |= (jsb_uint16_t)(buffer[1]) << 8;
    *result |= (jsb_uint16_t)(buffer[0]) << 0;
    return JSB_OK;
}
enum jsb_result_t jsb_encode_uint8(jsb_uint8_t* buffer, const jsb_uint8_t value) {
    buffer[0] = (value >> 0) & 0xFF;
    return JSB_OK;
}

enum jsb_result_t jsb_decode_uint8(const jsb_uint8_t* buffer, jsb_uint8_t* result) {
    *result = 0;
    *result |= (jsb_uint8_t)(buffer[0]) << 0;
    return JSB_OK;
}
