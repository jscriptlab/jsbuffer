function(jsb_compile_size_of TYPE VARIABLE)
  set(oneValueArgs HEADER)

  cmake_parse_arguments(JSB "" "${oneValueArgs}" "" ${ARGN})

  if(NOT JSB_HEADER)
    message(FATAL_ERROR "Missing header argument")
  endif()

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
      printf(\"%s=%lu\", \"${VARIABLE}\", sizeof(${TYPE}));
      return 0;
    }
  ")

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

  message(FATAL_ERROR ${RUN_RESULT})

  set(${VARIABLE} ${OUTPUT_VARIABLE} PARENT_SCOPE)
endfunction(jsb_compile_size_of)
