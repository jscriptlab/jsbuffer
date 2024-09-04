cmake_minimum_required(VERSION 3.10)
project(jsb_c C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED true)

include(CheckTypeSize)
include(${CMAKE_CURRENT_SOURCE_DIR}/FindHeaders.cmake)

# List of headers to check
set(INTEGER_HEADER_TYPES "stdint.h" "inttypes.h" "sys/types.h" "stddef.h")

find_headers("${INTEGER_HEADER_TYPES}" "STANDARD_TYPE_INTEGERS")

check_type_size("void" HAS_VOID_TYPE LANGUAGE C)
check_type_size("size_t" HAS_SIZE_TYPE LANGUAGE C)
check_type_size("uint64_t" HAS_UINT64_TYPE LANGUAGE C)
check_type_size("uint32_t" HAS_UINT32_TYPE LANGUAGE C)
check_type_size("uint16_t" HAS_UINT16_TYPE LANGUAGE C)
check_type_size("uint8_t" HAS_UINT8_TYPE LANGUAGE C)
check_type_size("int64_t" HAS_INT64_TYPE LANGUAGE C)
check_type_size("int32_t" HAS_INT32_TYPE LANGUAGE C)
check_type_size("int16_t" HAS_INT16_TYPE LANGUAGE C)
check_type_size("int8_t" HAS_INT8_TYPE LANGUAGE C)
check_type_size("unsigned char" HAS_UNSIGNED_CHAR LANGUAGE C)
check_type_size("unsigned int" HAS_UNSIGNED_INT LANGUAGE C)
check_type_size("unsigned long" HAS_UNSIGNED_LONG LANGUAGE C)
check_type_size("unsigned long long" HAS_UNSIGNED_LONG_LONG LANGUAGE C)

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
)
target_include_directories(jsb_c_static PUBLIC ${CMAKE_CURRENT_BINARY_DIR}/include ${CMAKE_CURRENT_SOURCE_DIR}/include)

add_subdirectory(test)