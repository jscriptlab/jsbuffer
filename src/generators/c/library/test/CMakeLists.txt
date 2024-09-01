project(jsb_codec_test CXX)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)

add_executable(jsb_codec_test codec.c codec.h
  test.h)
target_link_libraries(jsb_codec_test PRIVATE jsb_c_static)