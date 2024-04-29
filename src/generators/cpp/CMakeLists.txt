add_library(
  jsb SHARED
  serializer.cpp deserializer.cpp
)
target_include_directories(jsb PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)

add_executable(jsb_test test.cpp)
target_link_libraries(jsb_test PRIVATE jsb schema)
