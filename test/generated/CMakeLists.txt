option(JSB_SCHEMA_C99_LARGE_SCHEMA "Enable C99 large schema tests" ON)
option(JSB_SCHEMA_C99_SMALL_SCHEMA "Enable C99 small schema tests" ON)
option(JSB_SCHEMA_CPP "Enable C++ schema tests" ON)

if(JSB_SCHEMA_C99_LARGE_SCHEMA MATCHES ON)
  add_subdirectory(c/schemas/app)
endif()

if(JSB_SCHEMA_C99_SMALL_SCHEMA MATCHES ON)
  add_subdirectory(c/schemas/avr)
endif()

if(JSB_SCHEMA_CPP MATCHES ON)
  add_subdirectory(cpp)
endif()
