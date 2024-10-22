include(CheckTypeSize)
include(${CMAKE_CURRENT_SOURCE_DIR}/GetHeaderVariableName.cmake)
include(${CMAKE_CURRENT_SOURCE_DIR}/CheckHeaderTypeAvailability.cmake)

function(compile_custom_project ROOT_DIR JSB_SOURCE RESULT)
  set(oneValueArgs FILENAME TARGET_NAME FILENAME_SUFFIX)

  cmake_parse_arguments(JSB "" "${oneValueArgs}" "" ${ARGN})

  set(SOURCE_DIRECTORY "${ROOT_DIR}/Source")
  set(BUILD_DIRECTORY "${ROOT_DIR}/Build")

  if(JSB_TARGET_NAME STREQUAL "")
    message(FATAL_ERROR "Missing target name argument")
  endif()

  set(
    EMSCRIPTEN_LINK_OPTIONS
    "-sWASM=1"
    "-sEXIT_RUNTIME=1"
    "-sEXPORTED_FUNCTIONS=['_main']"
  )

  # Write a CMakeLists.txt file for the temporary project
  file(WRITE ${SOURCE_DIRECTORY}/CMakeLists.txt
  "
  cmake_minimum_required(VERSION 3.14)
  project(CustomCompilerProject C)

  add_executable(${JSB_TARGET_NAME} main.c)

  # Customize the output file name and extension
  set_target_properties(${JSB_TARGET_NAME} PROPERTIES
    OUTPUT_NAME \"${JSB_FILENAME}\"
    SUFFIX \"${JSB_FILENAME_SUFFIX}\"
  )

  target_compile_options(${JSB_TARGET_NAME} PRIVATE \"-O2\")
  target_link_options(${JSB_TARGET_NAME} PRIVATE \"${EMSCRIPTEN_LINK_OPTIONS}\")
  ")

  file(WRITE ${SOURCE_DIRECTORY}/main.c "${JSB_SOURCE}")

  # Run CMake configuration and build the temporary project
  execute_process(
    COMMAND ${CMAKE_COMMAND} -S "${SOURCE_DIRECTORY}" -B "${BUILD_DIRECTORY}"
    RESULT_VARIABLE CONFIGURE_RESULT
  )

  if(CONFIGURE_RESULT)
    message(FATAL_ERROR "CMake configuration failed for custom project.")
  endif()

  execute_process(
    COMMAND ${CMAKE_COMMAND} --build "${BUILD_DIRECTORY}"
    RESULT_VARIABLE BUILD_RESULT
  )

  if(BUILD_RESULT)
    set(${RESULT} OFF PARENT_SCOPE)
  else()
    set(${RESULT} ON PARENT_SCOPE)
  endif()
endfunction()

function(CHECK_TYPE_SIZE TYPE VARIABLE)
  set(oneValueArgs HEADER)

  cmake_parse_arguments(JSB "" "${oneValueArgs}" "" ${ARGN})

  set(SOURCE_FOLDER_NAME "${JSB_HEADER}")
  # Replace <, >, whitespace, dot, with underscore
  string(REPLACE "<" "_" SOURCE_FOLDER_NAME "${SOURCE_FOLDER_NAME}")
  string(REPLACE ">" "_" SOURCE_FOLDER_NAME "${SOURCE_FOLDER_NAME}")
  string(REPLACE "." "_" SOURCE_FOLDER_NAME "${SOURCE_FOLDER_NAME}")
  string(TOUPPER "${SOURCE_FOLDER_NAME}" SOURCE_FOLDER_NAME)

  set(SOURCE_FOLDER_NAME "${VARIABLE}_${SOURCE_FOLDER_NAME}")

  set(ROOT_FOLDER "${CMAKE_BINARY_DIR}/CMakeFiles/CheckTypeSize/${SOURCE_FOLDER_NAME}")

  # Set up the test source code
  set(SOURCE_CODE "
    #include <stdio.h>
    #include ${JSB_HEADER}
    int main() {
      printf(\"%lu\", sizeof(${TYPE}));
      return 0;
    }
  ")

  message(STATUS "Compiling code that includes \"${TYPE_NAME}\" in ${JSB_HEADER}")

  compile_custom_project(
    "${ROOT_FOLDER}"
    "${SOURCE_CODE}"
    OUTPUT_VARIABLE
    FILENAME "out"
    TARGET_NAME "test_${TYPE}"
    FILENAME_SUFFIX ".js"
  )

  execute_process(
    COMMAND node ${ROOT_FOLDER}/Build/out.js
    OUTPUT_VARIABLE RUN_RESULT
  )

  set(${VARIABLE} ${RUN_RESULT} PARENT_SCOPE)
endfunction()

function(jsb_check_type_size TYPE_NAME TYPE_NAME_VARIABLE_NAME)
  set(options BUILTIN_TYPES_ONLY REQUIRED)
  set(oneValueArgs CATEGORY_NAME)
  set(multiValueArgs HEADERS)

  # Parse arguments
  cmake_parse_arguments(JSB "${options}" "${oneValueArgs}" "${multiValueArgs}" ${ARGN})

  set(TYPE_SIZE_VARIABLE_NAME "JSB_CHECK_${TYPE_NAME_VARIABLE_NAME}_SIZE_RESULT")
  set(HAVE_TYPE_SIZE_VARIABLE_NAME "HAVE_${TYPE_SIZE_VARIABLE_NAME}")

  if("${CMAKE_SYSTEM_NAME}" STREQUAL "Emscripten")
    foreach(HEADER ${JSB_HEADERS})
      if(HEADER STREQUAL "")
        message(FATAL_ERROR "Missing header argument")
      endif()
      CHECK_TYPE_SIZE("${TYPE_NAME}" "${TYPE_SIZE_VARIABLE_NAME}" HEADER "<${HEADER}>")
      if(${TYPE_SIZE_VARIABLE_NAME})
        break()
      endif()
    endforeach()
  elseif(JSB_BUILTIN_TYPES_ONLY)
    check_type_size("${TYPE_NAME}" "${TYPE_SIZE_VARIABLE_NAME}" BUILTIN_TYPES_ONLY LANGUAGE C)
  else()
    check_type_size("${TYPE_NAME}" "${TYPE_SIZE_VARIABLE_NAME}" LANGUAGE C)
  endif()

  message(STATUS "${HAVE_TYPE_SIZE_VARIABLE_NAME} = ${${HAVE_TYPE_SIZE_VARIABLE_NAME}}")
  message(STATUS "${TYPE_SIZE_VARIABLE_NAME} = ${${TYPE_SIZE_VARIABLE_NAME}}")
  message(STATUS "${TYPE_SIZE_VARIABLE_NAME}_KEYS = ${${TYPE_SIZE_VARIABLE_NAME}_KEYS}")

#  get_cmake_property(allVars VARIABLES)
#
#  # Iterate over each variable and print its value
#  foreach(var IN LISTS allVars)
#    # If var starts with JSB_ print it
#    if(var MATCHES "JSB_CHECK_*")
#      message(STATUS "${var} = ${${var}}")
#    endif()
#  endforeach()

  if((NOT ${HAVE_TYPE_SIZE_VARIABLE_NAME} OR NOT ${TYPE_SIZE_VARIABLE_NAME}) AND JSB_REQUIRED)
    message(FATAL_ERROR "\"${TYPE_NAME}\" not found")
  elseif(${HAVE_TYPE_SIZE_VARIABLE_NAME} AND ${TYPE_SIZE_VARIABLE_NAME})
    set(OUTPUT_TYPE_SIZE_VARIABLE_NAME "JSB_${TYPE_NAME_VARIABLE_NAME}_SIZE")

    set(${HAVE_TYPE_SIZE_VARIABLE_NAME} ON CACHE BOOL "${TYPE_NAME} was found")
    set(JSB_${TYPE_NAME_VARIABLE_NAME}_SIZE "${${TYPE_SIZE_VARIABLE_NAME}}" CACHE STRING "Size of type ${TYPE_NAME}")

    message(STATUS "${OUTPUT_TYPE_SIZE_VARIABLE_NAME} = ${${OUTPUT_TYPE_SIZE_VARIABLE_NAME}}")
  else()
    message(NOTICE "Failed to find ${TYPE_NAME}")
#    message(FATAL_ERROR "Failed to find ${TYPE_NAME}")
  endif()

  # If user did not provide HEADERS, we are done
  if(NOT JSB_HEADERS)
    if(DEFINED JSB_CATEGORY_NAME)
      message(FATAL_ERROR "No headers were provided for ${JSB_CATEGORY_NAME}")
    endif()
    return()
  endif()

  set(TYPE_HEADER_VARIABLE_NAME_PREFIX "${TYPE_NAME_VARIABLE_NAME}_HEADER")

  foreach(HEADER ${JSB_HEADERS})
    jsb_get_header_variable_name("${HEADER}" HEADER_TRANSFORMED_NAME)

    set(CHECK_HEADER_TYPE_AVAILABILITY_RESULT "${HEADER_TRANSFORMED_NAME}_PROVIDES_${TYPE_NAME_VARIABLE_NAME}")

    jsb_check_header_type_availability("${HEADER}" "${TYPE_NAME}" OUTPUT "${CHECK_HEADER_TYPE_AVAILABILITY_RESULT}")

    if(NOT ${CHECK_HEADER_TYPE_AVAILABILITY_RESULT})
      message(STATUS "Couldn't compile code that includes \"${TYPE_NAME}\" in ${HEADER}")
      continue()
    endif()

    set(${TYPE_HEADER_VARIABLE_NAME_PREFIX}_FOUND ON CACHE BOOL "Header was found for ${TYPE_NAME}")
    set(${TYPE_HEADER_VARIABLE_NAME_PREFIX} "<${HEADER}>" CACHE STRING "Header to obtain ${TYPE_NAME}")
    break()
  endforeach()

  if(NOT ${${TYPE_HEADER_VARIABLE_NAME_PREFIX}_FOUND})
    message(ERROR "\"${TYPE_NAME}\" not found on any of ${JSB_HEADERS}")
    return()
  endif()

  if(DEFINED JSB_CATEGORY_NAME)
    set(${JSB_CATEGORY_NAME}_FOUND ON CACHE BOOL "${TYPE_NAME} was found")
    set(${JSB_CATEGORY_NAME}_HEADER "${${TYPE_HEADER_VARIABLE_NAME_PREFIX}}" CACHE STRING "Header of ${TYPE_NAME}")
  endif()

  message(STATUS "Setting found category variable: ${JSB_CATEGORY_NAME}_FOUND")

  set(VARIABLES "${TYPE_HEADER_VARIABLE_NAME_PREFIX}_FOUND" "${TYPE_HEADER_VARIABLE_NAME_PREFIX}")

  foreach(VARIABLE ${VARIABLES})
    message(STATUS "Stored \"${TYPE_NAME}\" header information on: ${VARIABLE}")
  endforeach()
endfunction(jsb_check_type_size)
