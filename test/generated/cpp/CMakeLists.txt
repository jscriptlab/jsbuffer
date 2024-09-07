cmake_minimum_required(VERSION 3.5)
project(schema)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_library(
    schema STATIC
    test_schema/Message.hpp test_schema/Message.cpp test_schema/AcknowledgeMessage.hpp test_schema/AcknowledgeMessage.cpp
    test_schema/ImportLocalType.hpp test_schema/ImportLocalType.cpp schema_internal_test/internal/ImportMeWithId.hpp
    schema_internal_test/internal/ImportMeWithId.cpp event/Event.hpp event/Event.cpp test/ImportMe.hpp
    test/ImportMe.cpp
)
target_link_libraries(
    schema
    PUBLIC
    jsb
)
target_include_directories(
    schema
    PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
)
