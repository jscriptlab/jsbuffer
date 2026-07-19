project(jsb_codec_test C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)

add_executable(jsb_codec_test codec.c codec.h
  test.h
  rand.c
  rand.h)
target_link_libraries(jsb_codec_test PRIVATE jsb_c_static)

add_custom_target(jsb_test_codec
    COMMAND time ./jsb_codec_test
    DEPENDS jsb_codec_test
    WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
    COMMENT "Running jsb_codec_test test..."
)

