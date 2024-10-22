# Set OUTPUT to BOOL ON or OFF if INPUT matches any of VALUES
function(jsb_test INPUT VALUES OUTPUT)
  set(${OUTPUT} OFF BOOL PARENT_SCOPE)
  foreach(VALUE ${VALUES})
    message(STATUS "Checking if ${INPUT} matches ${VALUE}")
    if(${INPUT} MATCHES ${VALUE})
      set(${OUTPUT} ON BOOL PARENT_SCOPE)
      return()
    endif()
  endforeach()
endfunction(jsb_test)

function(jsb_get_boolean INPUT OUTPUT)
  set(JSB_GET_BOOLEAN_TRUTHY_VALUES "TRUE" "ON" "1" "YES" "Y" "y")
  set(JSB_GET_BOOLEAN_FALSY_VALUES "FALSE" "OFF" "0" "NO" "N" "n")

  jsb_test("${INPUT}" "${TRUTHY_VALUES}" "${OUTPUT}")

  if(NOT ${OUTPUT})
    jsb_test("${INPUT}" "${FALSY_VALUES}" "${OUTPUT}")
  endif()

  if(NOT ${OUTPUT} MATCHES ON AND NOT ${OUTPUT} MATCHES OFF)
    message(FATAL_ERROR "Failed to match ${INPUT} as a boolean")
  endif()

  set(${OUTPUT} ${${OUTPUT}} BOOL PARENT_SCOPE)
endfunction(jsb_get_boolean)

function(jsb_check_header_type_availability HEADER TYPE)
  set(options REQUIRED)
  set(oneValueArgs OUTPUT)

  cmake_parse_arguments(JSB "${options}" "${oneValueArgs}" "" ${ARGN})

  set(${JSB_OUTPUT} OFF PARENT_SCOPE)

  set(CODE "
    #include <${HEADER}>

    int main(void) {
      ${TYPE_NAME} value;
      return 0;
    }
  ")

  message(STATUS "Checking if ${HEADER} includes ${TYPE_NAME}")

  set(FILENAME "jsb_check_header_type_availability_${TYPE}_${HEADER}")

  # Replace slashes with underscores
  string(REPLACE "/" "_" FILENAME ${FILENAME})
  # Replace dots with underscores
  string(REPLACE "." "_" FILENAME ${FILENAME})

  set(JSB_TRY_COMPILE_RESULT OFF CACHE BOOL "Whether ${TYPE_NAME} is found on ${HEADER}")

  try_compile(
    JSB_TRY_COMPILE_RESULT
    SOURCE_FROM_CONTENT "${FILENAME}.c" "${CODE}"
    NO_CACHE
    OUTPUT_VARIABLE JSB_TRY_COMPILE_OUTPUT
  )

  jsb_get_boolean("${JSB_TRY_COMPILE_RESULT}" "${JSB_TRY_COMPILE_RESULT}")

  if(NOT ${JSB_TRY_COMPILE_RESULT} MATCHES ON AND ${JSB_REQUIRED})
    message(
      FATAL_ERROR
      "Failed to compile ${TYPE} with ${HEADER}:"
      "${JSB_TRY_COMPILE_OUTPUT}"
    )
  endif()

  set(${JSB_OUTPUT} ${JSB_TRY_COMPILE_RESULT} CACHE BOOL "Whether ${TYPE_NAME} is found on ${HEADER}" PARENT_SCOPE)

  message(STATUS "Successfully compiled ${TYPE} with ${HEADER}: ${JSB_OUTPUT}")
endfunction()
