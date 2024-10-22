cmake_minimum_required(VERSION 3.5)

project(jsbuffer)

#if("${CMAKE_SYSTEM_NAME}" STREQUAL "Emscripten")
##   if(NOT DEFINED EMSCRIPTEN_OPTIONS)
##     message(FATAL_ERROR "EMSCRIPTEN_OPTIONS must be set")
##   endif()
#
#  add_definitions(-Wfatal-errors -Wall -Wextra -Werror -pedantic)
#
##   # set(CMAKE_EXE_LINKER_FLAGS ${CMAKE_EXE_LINKER_FLAGS} ${EMSCRIPTEN_OPTIONS})
##   # set(CMAKE_MODULE_LINKER_FLAGS ${CMAKE_MODULE_LINKER_FLAGS} ${EMSCRIPTEN_OPTIONS})
##   # set(CMAKE_SHARED_LINKER_FLAGS ${CMAKE_SHARED_LINKER_FLAGS} ${EMSCRIPTEN_OPTIONS})
##   # set(CMAKE_C_FLAGS ${CMAKE_C_FLAGS} ${EMSCRIPTEN_OPTIONS})
##   # set(CMAKE_CXX_FLAGS ${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_OPTIONS})
#
##   add_link_options(${EMSCRIPTEN_OPTIONS})
#endif()

add_subdirectory(src)
add_subdirectory(test)
