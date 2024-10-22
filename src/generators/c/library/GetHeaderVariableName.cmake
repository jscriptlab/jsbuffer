function(jsb_get_header_variable_name HEADER OUTPUT)
  string(TOUPPER ${HEADER} ${OUTPUT})
  string(REPLACE ".H" "" ${OUTPUT} ${${OUTPUT}})
  string(REPLACE "/" "_" ${OUTPUT} ${${OUTPUT}})

  set(${OUTPUT} ${${OUTPUT}} PARENT_SCOPE)
endfunction(jsb_get_header_variable_name)
