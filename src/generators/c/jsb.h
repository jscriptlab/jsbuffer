#ifndef JSBUFFER_JSB_H
#define JSBUFFER_JSB_H

enum jsb_result_t {
    JSB_OK = 0,
    JSB_ERROR = 1,
    JSB_MALLOC_ERROR = 2,
    JSB_BUFFER_OVERFLOW = 2
};

typedef unsigned char* jsb_bytes_t;
typedef signed long jsb_int64_t;
typedef unsigned long jsb_uint64_t;
typedef signed int jsb_int32_t;
typedef unsigned int jsb_uint32_t;
typedef unsigned short jsb_uint16_t;
typedef signed short jsb_int16_t;
typedef unsigned char jsb_uint8_t;
typedef signed char jsb_int8_t;
typedef const char* jsb_string_t;

#endif // JSBUFFER_JSB_H
