cmake_minimum_required(VERSION 3.5)
project(app C ASM)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS ON)

add_library(
    app STATIC
    app/deep_optional.h app/deep_optional.c app/message.h app/message.c app/command_move_forward.h
    app/command_move_forward.c app/command_move_backwards.h app/command_move_backwards.c
    app/command_trait.h app/command_trait.c protocol/main/request_trait.h protocol/main/request_trait.c
    protocol/main/response_trait.h protocol/main/response_trait.c protocol/main/void.h protocol/main/void.c
    protocol/main/user.h protocol/main/user.c protocol/main/get_user.h protocol/main/get_user.c
    protocol/main/tuple_test.h protocol/main/tuple_test.c
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


if(JSB_SCHEMA_TESTS MATCHES ON)
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
endif()

