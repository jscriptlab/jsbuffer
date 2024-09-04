cmake_minimum_required(VERSION 3.5)
project(app C ASM)
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
add_library(
    app STATIC
    app/message.h app/message.c app/command_move_forward.h app/command_move_forward.c app/command_move_backwards.h
    app/command_move_backwards.c app/command_trait.h app/command_trait.c protocol/main/request_trait.h
    protocol/main/request_trait.c protocol/main/response_trait.h protocol/main/response_trait.c
    protocol/main/void.h protocol/main/void.c protocol/main/user.h protocol/main/user.c protocol/main/get_user.h
    protocol/main/get_user.c
)
target_link_libraries(
    app
    PUBLIC
    jsb_c_static
)
target_compile_options(
    app
    PRIVATE
    -Wall
    -Wextra
    -Werror
    -pedantic
)
target_include_directories(
    app
    PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
)

add_executable(app_test test.c)
target_compile_options(
    app_test
    PRIVATE
    -Wall
    -Wextra
    -Werror
    -pedantic
)
target_link_libraries(app_test PRIVATE app)
