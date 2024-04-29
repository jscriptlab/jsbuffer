cmake_minimum_required(VERSION 3.5)
project(jsbuffer CXX)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(src/generators/cpp)
add_subdirectory(test/generated/cpp)
