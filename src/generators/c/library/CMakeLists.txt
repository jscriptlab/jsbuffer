cmake_minimum_required(VERSION 3.10)
project(jsb_c C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED true)
set(CMAKE_C_EXTENSIONS ON)

# JSB_TRACE option
option(JSB_TRACE "Enable trace messages" OFF)
option(JSB_SERIALIZER_USE_MALLOC "Use malloc for serializer buffer. If this option is set, it is recommended to also set JSB_SERIALIZER_BUFFER_SIZE, otherwise it will default to a predefined size." OFF)
option(JSB_DISABLE_ERROR_ASSERTION "Disable error checking on every function call (Only set this to ON, if you know what you are doing)." OFF)
option(JSB_TOLERATE_TYPE_OVERFLOW "If this option is enabled, instead of returning JSB_BUFFER_OVERFLOW, it will trim the string or buffer of a type or call definition during decoding." OFF)
option(JSB_SCHEMA_MALLOC "If this option is enabled, the generated schema will use malloc for the buffer. If this option is set, it is recommended to also set JSB_MAX_STRING_SIZE, otherwise it will default to a predefined size." OFF)
option(JSB_SCHEMA_NO_ASSIGNMENT_ENUMS "If this option is enabled, the generated schema will not have assignment enums for the signed 32-bit integer CRC header." OFF)
option(JSB_SCHEMA_TESTS "If this option is disable, the generated schema will not have tests." ON)
option(JSB_CODEC_TESTS "If this option is disable, the generated codec will not have tests." ON)

include(CheckTypeSize)
include(${CMAKE_CURRENT_SOURCE_DIR}/FindHeaders.cmake)

include(CheckSymbolExists)
check_symbol_exists(printf "stdio.h" HAVE_PRINTF)
check_symbol_exists(fprintf "stdio.h" HAVE_FPRINTF)
check_symbol_exists(strlen "string.h" HAVE_STRLEN)
check_symbol_exists(memcpy "string.h" HAVE_MEMCPY)
check_symbol_exists(memset "string.h" HAVE_MEMSET)
check_symbol_exists(strcpy "string.h" HAVE_STRCPY)
check_symbol_exists(strncmp "string.h" HAVE_STRNCMP)
check_symbol_exists(strcmp "string.h" HAVE_STRCMP)
check_symbol_exists(strncpy "string.h" HAVE_STRNCPY)
check_symbol_exists(malloc "stdlib.h" HAVE_MALLOC)
check_symbol_exists(free "stdlib.h" HAVE_FREE)

# List of headers to check
set(INTEGER_HEADERS "stdint.h" "inttypes.h" "sys/types.h" "stddef.h")
set(STRING_HEADERS "string.h")
set(STDLIB_HEADERS "stdio.h" "stdlib.h")

find_headers("${INTEGER_HEADERS}" "STANDARD_TYPE_INTEGERS")
find_headers("${STRING_HEADERS}" "STANDARD_TYPE_STRING")
find_headers("${STDLIB_HEADERS}" "STDLIB_HEADERS")

check_type_size("void" HAVE_VOID_TYPE LANGUAGE C)
check_type_size("size_t" HAVE_SIZE_TYPE LANGUAGE C)
check_type_size("uint64_t" HAVE_UINT64_TYPE LANGUAGE C)
check_type_size("float" HAVE_FLOAT_TYPE LANGUAGE C)
check_type_size("double" HAVE_DOUBLE_TYPE LANGUAGE C)
check_type_size("uint32_t" HAVE_UINT32_TYPE LANGUAGE C)
check_type_size("uint16_t" HAVE_UINT16_TYPE LANGUAGE C)
check_type_size("uint8_t" HAVE_UINT8_TYPE LANGUAGE C)
check_type_size("int64_t" HAVE_INT64_TYPE LANGUAGE C)
check_type_size("int32_t" HAVE_INT32_TYPE LANGUAGE C)
check_type_size("int16_t" HAVE_INT16_TYPE LANGUAGE C)
check_type_size("int8_t" HAVE_INT8_TYPE LANGUAGE C)

# Check for built-in types
check_type_size("signed char" HAVE_SIGNED_CHAR LANGUAGE C)
check_type_size("unsigned char" HAVE_UNSIGNED_CHAR LANGUAGE C)
check_type_size("signed int" HAVE_SIGNED_INT LANGUAGE C)
check_type_size("unsigned int" HAVE_UNSIGNED_INT LANGUAGE C)
check_type_size("signed long" HAVE_SIGNED_LONG LANGUAGE C)
check_type_size("unsigned long" HAVE_UNSIGNED_LONG LANGUAGE C)
check_type_size("signed short" HAVE_SIGNED_SHORT LANGUAGE C)
check_type_size("unsigned short" HAVE_UNSIGNED_SHORT LANGUAGE C)
check_type_size("signed long long" HAVE_SIGNED_LONG_LONG LANGUAGE C)
check_type_size("unsigned long long" HAVE_UNSIGNED_LONG_LONG LANGUAGE C)

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
target_include_directories(jsb_c_static PUBLIC ${CMAKE_CURRENT_BINARY_DIR}/include ${CMAKE_CURRENT_SOURCE_DIR}/include)

if(JSB_CODEC_TESTS MATCHES ON)
  add_subdirectory(test)
endif()
