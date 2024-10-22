add_subdirectory(c)

option(JSB_CPP "Enable C++ generator" ON)

if(JSB_CPP MATCHES ON)
  add_subdirectory(cpp)
endif()
