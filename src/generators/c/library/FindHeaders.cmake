include(${CMAKE_CURRENT_SOURCE_DIR}/FindHeader.cmake)

# Deprecated: Use jsb_find_header directly
function(jsb_find_headers HEADER_LIST)
  foreach(HEADER ${HEADER_LIST})
    jsb_find_header(${HEADER})
  endforeach()
endfunction()
