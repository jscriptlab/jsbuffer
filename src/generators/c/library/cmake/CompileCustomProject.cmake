
function(compile_custom_project ROOT_DIR JSB_SOURCE RESULT)
  set(oneValueArgs FILENAME TARGET_NAME FILENAME_SUFFIX)

  cmake_parse_arguments(JSB "" "${oneValueArgs}" "" ${ARGN})

  set(SOURCE_DIRECTORY "${ROOT_DIR}/Source")
  set(BUILD_DIRECTORY "${ROOT_DIR}/Build")

  set(
    EMSCRIPTEN_LINK_OPTIONS
    "-sWASM=1"
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

