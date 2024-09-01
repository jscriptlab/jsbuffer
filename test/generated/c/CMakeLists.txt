cmake_minimum_required(VERSION 3.5)
project(c_schema)
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
add_library(
    c_schema STATIC
    c_schema/Message.h c_schema/Message.c c_schema/Command.h c_schema/Command.c
)
target_link_libraries(
    c_schema
    PUBLIC
    jsb_c_static
)
target_include_directories(
    c_schema
    PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
)
