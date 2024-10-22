#ifndef JSB_INTEGER_FALLBACK_H_
#define JSB_INTEGER_FALLBACK_H_

#ifndef JSBUFFER_C_JSB_H
#error "<jsb/jsb.h> must be included before <jsb/internal.h>"
#endif

#if defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND) 

#include INT8_TYPE_HEADER

typedef int8_t jsb_int8_t;

#define JSB_INT8_FOUND
#elif defined(HAVE_SIGNED_CHAR_TYPE) && defined(SIGNED_CHAR_TYPE_HEADER_FOUND) // defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND)

#include SIGNED_CHAR_TYPE_HEADER

typedef signed char jsb_int8_t;

#define JSB_INT8_FOUND
#else
#error "char not found. Tried for signed char, char"
#endif

#if defined(HAVE_UINT8_TYPE) && defined(UINT8_TYPE_HEADER_FOUND) 

#include UINT8_TYPE_HEADER

typedef uint8_t jsb_uint8_t;

#define JSB_UINT8_FOUND
#elif defined(HAVE_UNSIGNED_CHAR_TYPE) && defined(UNSIGNED_CHAR_TYPE_HEADER_FOUND) // defined(HAVE_UINT8_TYPE) && defined(UINT8_TYPE_HEADER_FOUND)

#include UNSIGNED_CHAR_TYPE_HEADER

typedef unsigned char jsb_uint8_t;

#define JSB_UINT8_FOUND
#else
#error "char not found. Tried for unsigned char, char"
#endif

#if defined(HAVE_INT16_TYPE) && defined(INT16_TYPE_HEADER_FOUND) 

#include INT16_TYPE_HEADER

typedef int16_t jsb_int16_t;

#define JSB_INT16_FOUND
#elif defined(HAVE_SIGNED_SHORT_TYPE) && defined(SIGNED_SHORT_TYPE_HEADER_FOUND) // defined(HAVE_INT16_TYPE) && defined(INT16_TYPE_HEADER_FOUND)

#include SIGNED_SHORT_TYPE_HEADER

typedef signed short jsb_int16_t;

#define JSB_INT16_FOUND
#elif defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_SHORT_TYPE) && defined(SIGNED_SHORT_TYPE_HEADER_FOUND)

#include INT8_TYPE_HEADER

typedef int8_t jsb_int16_t;

#define JSB_INT16_FOUND
#elif defined(HAVE_SIGNED_CHAR_TYPE) && defined(SIGNED_CHAR_TYPE_HEADER_FOUND) // defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND)

#include SIGNED_CHAR_TYPE_HEADER

typedef signed char jsb_int16_t;

#define JSB_INT16_FOUND
#else
#error "char not found. Tried for signed char, char, int8_t, signed char"
#endif

#if defined(HAVE_UINT16_TYPE) && defined(UINT16_TYPE_HEADER_FOUND) 

#include UINT16_TYPE_HEADER

typedef uint16_t jsb_uint16_t;

#define JSB_UINT16_FOUND
#elif defined(HAVE_UNSIGNED_SHORT_TYPE) && defined(UNSIGNED_SHORT_TYPE_HEADER_FOUND) // defined(HAVE_UINT16_TYPE) && defined(UINT16_TYPE_HEADER_FOUND)

#include UNSIGNED_SHORT_TYPE_HEADER

typedef unsigned short jsb_uint16_t;

#define JSB_UINT16_FOUND
#elif defined(HAVE_UINT8_TYPE) && defined(UINT8_TYPE_HEADER_FOUND) // defined(HAVE_UNSIGNED_SHORT_TYPE) && defined(UNSIGNED_SHORT_TYPE_HEADER_FOUND)

#include UINT8_TYPE_HEADER

typedef uint8_t jsb_uint16_t;

#define JSB_UINT16_FOUND
#elif defined(HAVE_UNSIGNED_CHAR_TYPE) && defined(UNSIGNED_CHAR_TYPE_HEADER_FOUND) // defined(HAVE_UINT8_TYPE) && defined(UINT8_TYPE_HEADER_FOUND)

#include UNSIGNED_CHAR_TYPE_HEADER

typedef unsigned char jsb_uint16_t;

#define JSB_UINT16_FOUND
#else
#error "char not found. Tried for unsigned char, char, uint8_t, unsigned char"
#endif

#if defined(HAVE_INT32_TYPE) && defined(INT32_TYPE_HEADER_FOUND) 

#include INT32_TYPE_HEADER

typedef int32_t jsb_int32_t;

#define JSB_INT32_FOUND
#elif defined(HAVE_SIGNED_INT_TYPE) && defined(SIGNED_INT_TYPE_HEADER_FOUND) // defined(HAVE_INT32_TYPE) && defined(INT32_TYPE_HEADER_FOUND)

#include SIGNED_INT_TYPE_HEADER

typedef signed int jsb_int32_t;

#define JSB_INT32_FOUND
#elif defined(HAVE_INT16_TYPE) && defined(INT16_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_INT_TYPE) && defined(SIGNED_INT_TYPE_HEADER_FOUND)

#include INT16_TYPE_HEADER

typedef int16_t jsb_int32_t;

#define JSB_INT32_FOUND
#elif defined(HAVE_SIGNED_SHORT_TYPE) && defined(SIGNED_SHORT_TYPE_HEADER_FOUND) // defined(HAVE_INT16_TYPE) && defined(INT16_TYPE_HEADER_FOUND)

#include SIGNED_SHORT_TYPE_HEADER

typedef signed short jsb_int32_t;

#define JSB_INT32_FOUND
#elif defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_SHORT_TYPE) && defined(SIGNED_SHORT_TYPE_HEADER_FOUND)

#include INT8_TYPE_HEADER

typedef int8_t jsb_int32_t;

#define JSB_INT32_FOUND
#elif defined(HAVE_SIGNED_CHAR_TYPE) && defined(SIGNED_CHAR_TYPE_HEADER_FOUND) // defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND)

#include SIGNED_CHAR_TYPE_HEADER

typedef signed char jsb_int32_t;

#define JSB_INT32_FOUND
#else
#error "char not found. Tried for signed char, char, int16_t, signed short, int8_t, signed char"
#endif

#if defined(HAVE_UINT32_TYPE) && defined(UINT32_TYPE_HEADER_FOUND) 

#include UINT32_TYPE_HEADER

typedef uint32_t jsb_uint32_t;

#define JSB_UINT32_FOUND
#elif defined(HAVE_UNSIGNED_INT_TYPE) && defined(UNSIGNED_INT_TYPE_HEADER_FOUND) // defined(HAVE_UINT32_TYPE) && defined(UINT32_TYPE_HEADER_FOUND)

#include UNSIGNED_INT_TYPE_HEADER

typedef unsigned int jsb_uint32_t;

#define JSB_UINT32_FOUND
#elif defined(HAVE_UINT16_TYPE) && defined(UINT16_TYPE_HEADER_FOUND) // defined(HAVE_UNSIGNED_INT_TYPE) && defined(UNSIGNED_INT_TYPE_HEADER_FOUND)

#include UINT16_TYPE_HEADER

typedef uint16_t jsb_uint32_t;

#define JSB_UINT32_FOUND
#elif defined(HAVE_UNSIGNED_SHORT_TYPE) && defined(UNSIGNED_SHORT_TYPE_HEADER_FOUND) // defined(HAVE_UINT16_TYPE) && defined(UINT16_TYPE_HEADER_FOUND)

#include UNSIGNED_SHORT_TYPE_HEADER

typedef unsigned short jsb_uint32_t;

#define JSB_UINT32_FOUND
#elif defined(HAVE_UINT8_TYPE) && defined(UINT8_TYPE_HEADER_FOUND) // defined(HAVE_UNSIGNED_SHORT_TYPE) && defined(UNSIGNED_SHORT_TYPE_HEADER_FOUND)

#include UINT8_TYPE_HEADER

typedef uint8_t jsb_uint32_t;

#define JSB_UINT32_FOUND
#elif defined(HAVE_UNSIGNED_CHAR_TYPE) && defined(UNSIGNED_CHAR_TYPE_HEADER_FOUND) // defined(HAVE_UINT8_TYPE) && defined(UINT8_TYPE_HEADER_FOUND)

#include UNSIGNED_CHAR_TYPE_HEADER

typedef unsigned char jsb_uint32_t;

#define JSB_UINT32_FOUND
#else
#error "char not found. Tried for unsigned char, char, uint16_t, unsigned short, uint8_t, unsigned char"
#endif

#if defined(HAVE_INT64_TYPE) && defined(INT64_TYPE_HEADER_FOUND) 

#include INT64_TYPE_HEADER

typedef int64_t jsb_int64_t;

#define JSB_INT64_FOUND
#elif defined(HAVE_SIGNED_LONG_LONG_LONG_TYPE) && defined(SIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND) // defined(HAVE_INT64_TYPE) && defined(INT64_TYPE_HEADER_FOUND)

#include SIGNED_LONG_LONG_LONG_TYPE_HEADER

typedef signed long,long long jsb_int64_t;

#define JSB_INT64_FOUND
#elif defined(HAVE_INT64_TYPE) && defined(INT64_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_LONG_LONG_LONG_TYPE) && defined(SIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND)

#include INT64_TYPE_HEADER

typedef int64_t jsb_int64_t;

#define JSB_INT64_FOUND
#elif defined(HAVE_SIGNED_LONG_LONG_LONG_TYPE) && defined(SIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND) // defined(HAVE_INT64_TYPE) && defined(INT64_TYPE_HEADER_FOUND)

#include SIGNED_LONG_LONG_LONG_TYPE_HEADER

typedef signed long,long long jsb_int64_t;

#define JSB_INT64_FOUND
#elif defined(HAVE_INT32_TYPE) && defined(INT32_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_LONG_LONG_LONG_TYPE) && defined(SIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND)

#include INT32_TYPE_HEADER

typedef int32_t jsb_int64_t;

#define JSB_INT64_FOUND
#elif defined(HAVE_SIGNED_INT_TYPE) && defined(SIGNED_INT_TYPE_HEADER_FOUND) // defined(HAVE_INT32_TYPE) && defined(INT32_TYPE_HEADER_FOUND)

#include SIGNED_INT_TYPE_HEADER

typedef signed int jsb_int64_t;

#define JSB_INT64_FOUND
#elif defined(HAVE_INT16_TYPE) && defined(INT16_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_INT_TYPE) && defined(SIGNED_INT_TYPE_HEADER_FOUND)

#include INT16_TYPE_HEADER

typedef int16_t jsb_int64_t;

#define JSB_INT64_FOUND
#elif defined(HAVE_SIGNED_SHORT_TYPE) && defined(SIGNED_SHORT_TYPE_HEADER_FOUND) // defined(HAVE_INT16_TYPE) && defined(INT16_TYPE_HEADER_FOUND)

#include SIGNED_SHORT_TYPE_HEADER

typedef signed short jsb_int64_t;

#define JSB_INT64_FOUND
#elif defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_SHORT_TYPE) && defined(SIGNED_SHORT_TYPE_HEADER_FOUND)

#include INT8_TYPE_HEADER

typedef int8_t jsb_int64_t;

#define JSB_INT64_FOUND
#elif defined(HAVE_SIGNED_CHAR_TYPE) && defined(SIGNED_CHAR_TYPE_HEADER_FOUND) // defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND)

#include SIGNED_CHAR_TYPE_HEADER

typedef signed char jsb_int64_t;

#define JSB_INT64_FOUND
#else
#error "char not found. Tried for signed char, char, int32_t, signed int, int16_t, signed short, int8_t, signed char"
#endif

#if defined(HAVE_UINT64_TYPE) && defined(UINT64_TYPE_HEADER_FOUND) 

#include UINT64_TYPE_HEADER

typedef uint64_t jsb_uint64_t;

#define JSB_UINT64_FOUND
#elif defined(HAVE_UNSIGNED_LONG_LONG_LONG_TYPE) && defined(UNSIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND) // defined(HAVE_UINT64_TYPE) && defined(UINT64_TYPE_HEADER_FOUND)

#include UNSIGNED_LONG_LONG_LONG_TYPE_HEADER

typedef unsigned long,long long jsb_uint64_t;

#define JSB_UINT64_FOUND
#elif defined(HAVE_UINT64_TYPE) && defined(UINT64_TYPE_HEADER_FOUND) // defined(HAVE_UNSIGNED_LONG_LONG_LONG_TYPE) && defined(UNSIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND)

#include UINT64_TYPE_HEADER

typedef uint64_t jsb_uint64_t;

#define JSB_UINT64_FOUND
#elif defined(HAVE_UNSIGNED_LONG_LONG_LONG_TYPE) && defined(UNSIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND) // defined(HAVE_UINT64_TYPE) && defined(UINT64_TYPE_HEADER_FOUND)

#include UNSIGNED_LONG_LONG_LONG_TYPE_HEADER

typedef unsigned long,long long jsb_uint64_t;

#define JSB_UINT64_FOUND
#elif defined(HAVE_UINT32_TYPE) && defined(UINT32_TYPE_HEADER_FOUND) // defined(HAVE_UNSIGNED_LONG_LONG_LONG_TYPE) && defined(UNSIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND)

#include UINT32_TYPE_HEADER

typedef uint32_t jsb_uint64_t;

#define JSB_UINT64_FOUND
#elif defined(HAVE_UNSIGNED_INT_TYPE) && defined(UNSIGNED_INT_TYPE_HEADER_FOUND) // defined(HAVE_UINT32_TYPE) && defined(UINT32_TYPE_HEADER_FOUND)

#include UNSIGNED_INT_TYPE_HEADER

typedef unsigned int jsb_uint64_t;

#define JSB_UINT64_FOUND
#elif defined(HAVE_UINT16_TYPE) && defined(UINT16_TYPE_HEADER_FOUND) // defined(HAVE_UNSIGNED_INT_TYPE) && defined(UNSIGNED_INT_TYPE_HEADER_FOUND)

#include UINT16_TYPE_HEADER

typedef uint16_t jsb_uint64_t;

#define JSB_UINT64_FOUND
#elif defined(HAVE_UNSIGNED_SHORT_TYPE) && defined(UNSIGNED_SHORT_TYPE_HEADER_FOUND) // defined(HAVE_UINT16_TYPE) && defined(UINT16_TYPE_HEADER_FOUND)

#include UNSIGNED_SHORT_TYPE_HEADER

typedef unsigned short jsb_uint64_t;

#define JSB_UINT64_FOUND
#elif defined(HAVE_UINT8_TYPE) && defined(UINT8_TYPE_HEADER_FOUND) // defined(HAVE_UNSIGNED_SHORT_TYPE) && defined(UNSIGNED_SHORT_TYPE_HEADER_FOUND)

#include UINT8_TYPE_HEADER

typedef uint8_t jsb_uint64_t;

#define JSB_UINT64_FOUND
#elif defined(HAVE_UNSIGNED_CHAR_TYPE) && defined(UNSIGNED_CHAR_TYPE_HEADER_FOUND) // defined(HAVE_UINT8_TYPE) && defined(UINT8_TYPE_HEADER_FOUND)

#include UNSIGNED_CHAR_TYPE_HEADER

typedef unsigned char jsb_uint64_t;

#define JSB_UINT64_FOUND
#else
#error "char not found. Tried for unsigned char, char, uint32_t, unsigned int, uint16_t, unsigned short, uint8_t, unsigned char"
#endif

#if defined(HAVE_SIZE_T_TYPE) && defined(SIZE_T_TYPE_HEADER_FOUND) 

#include SIZE_T_TYPE_HEADER

typedef size_t jsb_size_t;

#define JSB_JSB_SIZE_T_FOUND
#elif defined(HAVE_INT64_TYPE) && defined(INT64_TYPE_HEADER_FOUND) // defined(HAVE_SIZE_T_TYPE) && defined(SIZE_T_TYPE_HEADER_FOUND)

#include INT64_TYPE_HEADER

typedef int64_t jsb_size_t;

#define JSB_SIZE_FOUND
#elif defined(HAVE_SIGNED_LONG_LONG_LONG_TYPE) && defined(SIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND) // defined(HAVE_INT64_TYPE) && defined(INT64_TYPE_HEADER_FOUND)

#include SIGNED_LONG_LONG_LONG_TYPE_HEADER

typedef signed long,long long jsb_size_t;

#define JSB_SIZE_FOUND
#elif defined(HAVE_INT64_TYPE) && defined(INT64_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_LONG_LONG_LONG_TYPE) && defined(SIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND)

#include INT64_TYPE_HEADER

typedef int64_t jsb_size_t;

#define JSB_SIZE_FOUND
#elif defined(HAVE_SIGNED_LONG_LONG_LONG_TYPE) && defined(SIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND) // defined(HAVE_INT64_TYPE) && defined(INT64_TYPE_HEADER_FOUND)

#include SIGNED_LONG_LONG_LONG_TYPE_HEADER

typedef signed long,long long jsb_size_t;

#define JSB_SIZE_FOUND
#elif defined(HAVE_INT32_TYPE) && defined(INT32_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_LONG_LONG_LONG_TYPE) && defined(SIGNED_LONG_LONG_LONG_TYPE_HEADER_FOUND)

#include INT32_TYPE_HEADER

typedef int32_t jsb_size_t;

#define JSB_SIZE_FOUND
#elif defined(HAVE_SIGNED_INT_TYPE) && defined(SIGNED_INT_TYPE_HEADER_FOUND) // defined(HAVE_INT32_TYPE) && defined(INT32_TYPE_HEADER_FOUND)

#include SIGNED_INT_TYPE_HEADER

typedef signed int jsb_size_t;

#define JSB_SIZE_FOUND
#elif defined(HAVE_INT16_TYPE) && defined(INT16_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_INT_TYPE) && defined(SIGNED_INT_TYPE_HEADER_FOUND)

#include INT16_TYPE_HEADER

typedef int16_t jsb_size_t;

#define JSB_SIZE_FOUND
#elif defined(HAVE_SIGNED_SHORT_TYPE) && defined(SIGNED_SHORT_TYPE_HEADER_FOUND) // defined(HAVE_INT16_TYPE) && defined(INT16_TYPE_HEADER_FOUND)

#include SIGNED_SHORT_TYPE_HEADER

typedef signed short jsb_size_t;

#define JSB_SIZE_FOUND
#elif defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND) // defined(HAVE_SIGNED_SHORT_TYPE) && defined(SIGNED_SHORT_TYPE_HEADER_FOUND)

#include INT8_TYPE_HEADER

typedef int8_t jsb_size_t;

#define JSB_SIZE_FOUND
#elif defined(HAVE_SIGNED_CHAR_TYPE) && defined(SIGNED_CHAR_TYPE_HEADER_FOUND) // defined(HAVE_INT8_TYPE) && defined(INT8_TYPE_HEADER_FOUND)

#include SIGNED_CHAR_TYPE_HEADER

typedef signed char jsb_size_t;

#define JSB_SIZE_FOUND
#else
#error "char not found. Tried for signed char, char, int64_t, signed long,long long, int64_t, signed long,long long, int32_t, signed int, int16_t, signed short, int8_t, signed char"
#endif


#endif // JSB_INTEGER_FALLBACK_H_
