cmake_minimum_required(VERSION 3.10)

project(jsb_c LANGUAGES C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED true)
set(CMAKE_C_EXTENSIONS ON)

include(CheckTypeSize)
include(CheckSymbolExists)
include(${CMAKE_CURRENT_SOURCE_DIR}/FindSymbols.cmake)
include(${CMAKE_CURRENT_SOURCE_DIR}/CheckTypeSize.cmake)

set(INTEGER_HEADERS "stdint.h" "inttypes.h" "sys/types.h" "stddef.h" "sys/inttypes.h" "stdbool.h" "float.h" "math.h")

set(HEADERS ${INTEGER_HEADERS} "malloc.h" "string.h" "stdio.h" "stdlib.h")
set(SYMBOL_NAMES "NULL" "printf" "fprintf" "strlen" "memcpy" "memset" "strcpy" "strncmp" "strcmp" "strncpy" "malloc" "free")

# JSB_TRACE option
option(JSB_TRACE "Enable trace messages" OFF)
option(JSB_SERIALIZER_USE_MALLOC "Use malloc for serializer buffer. If this option is set, it is recommended to also set JSB_SERIALIZER_BUFFER_SIZE, otherwise it will default to a predefined size." OFF)
option(JSB_DISABLE_ERROR_ASSERTION "Disable error checking on every function call (Only set this to ON, if you know what you are doing)." OFF)
option(JSB_TOLERATE_TYPE_OVERFLOW "If this option is enabled, instead of returning JSB_BUFFER_OVERFLOW, it will trim the string or buffer of a type or call definition during decoding." OFF)
option(JSB_SCHEMA_MALLOC "If this option is enabled, the generated schema will use malloc for the buffer. If this option is set, it is recommended to also set JSB_MAX_STRING_SIZE, otherwise it will default to a predefined size." OFF)
option(JSB_SCHEMA_NO_ASSIGNMENT_ENUMS "If this option is enabled, the generated schema will not have assignment enums for the signed 32-bit integer CRC header." OFF)
option(JSB_SCHEMA_TESTS "If this option is disable, the generated schema will not have tests." ON)
option(JSB_CODEC_TESTS "If this option is disable, the generated codec will not have tests." ON)

jsb_check_type_size("size_t" SIZE_T_TYPE CATEGORY_NAME "JSB_INTEGER_TYPE" HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("uint64_t" UINT64_TYPE CATEGORY_NAME "JSB_INTEGER_TYPE" HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("uint32_t" UINT32_TYPE CATEGORY_NAME "JSB_INTEGER_TYPE" HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("uint16_t" UINT16_TYPE CATEGORY_NAME "JSB_INTEGER_TYPE" HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("uint8_t" UINT8_TYPE CATEGORY_NAME "JSB_INTEGER_TYPE" HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("int64_t" INT64_TYPE CATEGORY_NAME "JSB_INTEGER_TYPE" HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("int32_t" INT32_TYPE CATEGORY_NAME "JSB_INTEGER_TYPE" HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("int16_t" INT16_TYPE CATEGORY_NAME "JSB_INTEGER_TYPE" HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("int8_t" INT8_TYPE CATEGORY_NAME "JSB_INTEGER_TYPE" HEADERS ${INTEGER_HEADERS})

# Check for built-in types
jsb_check_type_size("void" VOID_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("float" FLOAT_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("double" DOUBLE_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("signed char" SIGNED_CHAR_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("unsigned char" UNSIGNED_CHAR_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("signed int" SIGNED_INT_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("unsigned int" UNSIGNED_INT_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("signed long" SIGNED_LONG_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("unsigned long" UNSIGNED_LONG_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("signed short" SIGNED_SHORT_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("unsigned short" UNSIGNED_SHORT_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("signed long long" SIGNED_LONG_LONG_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})
jsb_check_type_size("unsigned long long" UNSIGNED_LONG_LONG_TYPE CATEGORY_NAME "JSB_INTEGER_BUILTIN_TYPE" BUILTIN_TYPES_ONLY HEADERS ${INTEGER_HEADERS})

jsb_find_symbols("${SYMBOL_NAMES}" "${HEADERS}" CATEGORY_NAME "")

configure_file(${CMAKE_CURRENT_SOURCE_DIR}/jsb.h.in ${CMAKE_CURRENT_BINARY_DIR}/include/jsb/jsb.h)

add_library(
  jsb_c_static STATIC
  serializer.c include/jsb/serializer.h
  codec.h codec.c
  deserializer.c
  include/jsb/deserializer.h
  jsb.c
  ieee754.c
  include/jsb/ieee754.h
)
target_include_directories(jsb_c_static
  PUBLIC ${CMAKE_CURRENT_BINARY_DIR}/include ${CMAKE_CURRENT_SOURCE_DIR}/include
)

if(JSB_CODEC_TESTS MATCHES ON)
  add_subdirectory(test)
endif()
