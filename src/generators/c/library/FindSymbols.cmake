include(CheckSymbolExists)
include(${CMAKE_CURRENT_SOURCE_DIR}/GetHeaderVariableName.cmake)

# Function to find symbols that include a specific header
# It guarantees that the following variables are only set if the function is successful in finding the symbol:
# 
# - {toUpperCase($SYMBOL_NAMES[n])}_FOUND
# - {toUpperCase($SYMBOL_NAMES[n])}_HEADER
#
# This means you can safely assume that if `{toUpperCase($SYMBOL_NAMES[n])}_FOUND` is set, then `{toUpperCase($SYMBOL_NAMES[n])}_HEADER` is also set.
function(jsb_find_symbols SYMBOL_NAMES HEADERS)
  set(oneValueArgs CATEGORY_NAME)

  # Parse arguments
  cmake_parse_arguments(JSB "" "${oneValueArgs}" "" ${ARGN})

  foreach(SYMBOL_NAME ${SYMBOL_NAMES})
    # Convert the symbol name to uppercase for variable names
    string(TOUPPER "${SYMBOL_NAME}" UPPER_SYMBOL_NAME)

    foreach(HEADER ${HEADERS})
      # Convert the header name to uppercase for variable names
      string(TOUPPER "${HEADER}" UPPER_HEADER_NAME)

      set(SYMBOL_FOUND_VARIABLE_NAME "${UPPER_SYMBOL_NAME}_FOUND_ON_${UPPER_HEADER_NAME}")

      message(STATUS "Checking for ${SYMBOL_NAME} in ${HEADER}")
      check_symbol_exists(${SYMBOL_NAME} ${HEADER} ${SYMBOL_FOUND_VARIABLE_NAME})

      if(${${SYMBOL_FOUND_VARIABLE_NAME}})
        jsb_get_header_variable_name(${HEADER} HEADER_VARIABLE_NAME)

        set("${UPPER_SYMBOL_NAME}_FOUND" ON CACHE BOOL "Type of ${SYMBOL_NAME}")
        # Create variable that holds the header path
        set("${UPPER_SYMBOL_NAME}_HEADER" "<${HEADER}>" CACHE STRING "Header of ${SYMBOL_NAME}")
        if(JSB_CATEGORY_NAME)
          set("${JSB_CATEGORY_NAME}_HEADER" "${HEADER}" CACHE STRING "Header name of ${SYMBOL_NAME}")
        endif()
        break()
      endif()
    endforeach()

    if(NOT ${UPPER_SYMBOL_NAME}_FOUND)
      message(FATAL_ERROR "Could not find ${SYMBOL_NAME} (${UPPER_SYMBOL_NAME})")
    endif()
  endforeach()
endfunction(jsb_find_symbols)
