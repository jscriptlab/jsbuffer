cmake_minimum_required(VERSION 3.10)
project(jsb_c C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED true)

include(CheckTypeSize)
include(CheckFunctionExists)
include(${CMAKE_CURRENT_SOURCE_DIR}/FindHeaders.cmake)

check_function_exists(strlen HAVE_STRLEN)
check_function_exists(memcpy HAVE_MEMCPY)
check_function_exists(memset HAVE_MEMSET)

# List of headers to check
set(INTEGER_HEADERS "stdint.h" "inttypes.h" "sys/types.h" "stddef.h")
set(STRING_HEADERS "string.h")
set(STDIO_HEADERS "stdio.h")

find_headers("${INTEGER_HEADERS}" "STANDARD_TYPE_INTEGERS")
find_headers("${STRING_HEADERS}" "STANDARD_TYPE_STRING")
find_headers("${STDIO_HEADERS}" "STDIO_HEADERS")

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
check_type_size("unsigned char" HAVE_UNSIGNED_CHAR LANGUAGE C)
check_type_size("unsigned int" HAVE_UNSIGNED_INT LANGUAGE C)
check_type_size("unsigned long" HAVE_UNSIGNED_LONG LANGUAGE C)
check_type_size("unsigned long long" HAVE_UNSIGNED_LONG_LONG LANGUAGE C)

if(NOT DEFINED JSB_MAX_STRING_SIZE)
  set(JSB_MAX_STRING_SIZE 64)
endif()

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

add_subdirectory(test)