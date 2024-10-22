include(${CMAKE_CURRENT_SOURCE_DIR}/GetHeaderVariableName.cmake)

function(jsb_find_header HEADER)
  jsb_get_header_variable_name(${HEADER} HEADER_TRANSFORMED_NAME)

  set(HEADER_FOUND_VARIABLE_NAME "${HEADER_TRANSFORMED_NAME}_FOUND" STRING "Holds the name of the variable that corresponds to ${HEADER} being found or not")
  set(${HEADER_FOUND_VARIABLE_NAME} OFF CACHE BOOL INTERNAL "Whether \"${HEADER}\" was found or not")

  # Make sure HEADER is available for import
  if(NOT ${HEADER_FOUND_VARIABLE_NAME})
    check_include_file(${HEADER} ${HEADER_FOUND_VARIABLE_NAME})
  endif()

  # if(${HEADER_FOUND_VARIABLE_NAME})
  #   message(STATUS "${HEADER} includes ${TYPE_NAME}")
  # else()
  #   message(STATUS "${HEADER} does not include ${TYPE_NAME}")
  #   return()
  # endif()

  # set(COMPILED_SUCCESSFUL OFF BOOL CACHE INTERNAL "Whether a header was found for ${TYPE_NAME} or not")
  # set(CODE "
  #   #include <${HEADER}>

  #   int main() {
  #     ${TYPE_NAME} value;
  #     return 0;
  #   }
  # ")

  # # Check if the code compiles
  # check_c_source_compiles(
  #   "${CODE}"
  #   COMPILED_SUCCESSFUL
  # )

  # set(${TYPE_HEADER_PATH_VARIABLE_NAME} "<${HEADER}>" CACHE STRING "Header to import to have access to ${TYPE_NAME}")
  # set(${HEADER_FOUND_VARIABLE_NAME} ${COMPILED_SUCCESSFUL} CACHE BOOL "Whether a header was found for ${TYPE_NAME} or not")
endfunction(jsb_find_header)
