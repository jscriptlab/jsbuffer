cmake_minimum_required(VERSION 3.5)
project(avr_simple_schema C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS ON)

add_library(
  avr_simple_schema_static STATIC
  simple_schema/user.h simple_schema/user.c simple_schema/post_trait.h simple_schema/post_trait.c
  simple_schema/post_active.h simple_schema/post_active.c simple_schema/post_deleted.h
  simple_schema/post_deleted.c
)
target_link_libraries(
  avr_simple_schema_static
  PUBLIC
  jsb_c_static
)
target_compile_options(
  avr_simple_schema_static
  PRIVATE
  -Wall
  -Wextra
  -Werror
  -pedantic
)
target_include_directories(
  avr_simple_schema_static
  PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}
)
add_library(
  avr_simple_schema SHARED
  simple_schema/user.h simple_schema/user.c simple_schema/post_trait.h simple_schema/post_trait.c
  simple_schema/post_active.h simple_schema/post_active.c simple_schema/post_deleted.h
  simple_schema/post_deleted.c
)
target_link_libraries(
  avr_simple_schema
  PUBLIC
  jsb_c_static
)
target_compile_options(
  avr_simple_schema
  PRIVATE
  -Wall
  -Wextra
  -Werror
  -pedantic
)
target_include_directories(
  avr_simple_schema
  PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}
)


if(JSB_SCHEMA_TESTS MATCHES ON)
  add_executable(avr_simple_schema_test test.c)
  target_compile_options(
    avr_simple_schema_test
    PRIVATE
    -Wall
    -Wextra
    -Werror
    -pedantic
  )
  target_link_libraries(avr_simple_schema_test PRIVATE avr_simple_schema_static)
endif()

