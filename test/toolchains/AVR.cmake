# AVR-specific toolchain for CMake

# Required options
set(AVR_TOOLCHAIN_PATH "/usr" CACHE STRING "Path to the AVR toolchain")
set(AVR_ROOT_PATH "${AVR_TOOLCHAIN_PATH}/avr" CACHE STRING "Path to the AVR root directory")
set(AVR_INCLUDE_PATH "${AVR_ROOT_PATH}/include" CACHE STRING "Path to the AVR include directory")
set(MCU "" CACHE STRING "Target AVR MCU")
set(F_CPU "" CACHE STRING "Target AVR CPU frequency")

# Check if the AVR toolchain path is set
if(NOT DEFINED AVR_TOOLCHAIN_PATH)
  message(FATAL_ERROR "Please specify the path to the AVR toolchain")
endif()

# Specify the target MCU (change this to match your specific AVR chip)
if(NOT DEFINED MCU)
  message(FATAL_ERROR "Please specify the target MCU: ${MCU}")
endif()

# Frequency of the AVR clock
if(NOT DEFINED F_CPU)
  message(FATAL_ERROR "Please specify the target CPU frequency")
endif()

# Specify the cross compiler
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED true)
set(CMAKE_C_COMPILER ${AVR_TOOLCHAIN_PATH}/bin/avr-gcc)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_C_EXTENSIONS ON)
set(AVR_C_FLAGS "-mmcu=${MCU} -DF_CPU=${F_CPU} -fshort-enums -Wl,--gc-sections,-Map,output.map -fstack-usage")

# Set default extension to .elf
set(CMAKE_EXECUTABLE_SUFFIX_C .elf)
set(CMAKE_EXECUTABLE_SUFFIX_CXX .elf)

# AVR-specific executables
set(CMAKE_OBJCOPY ${AVR_TOOLCHAIN_PATH}/bin/avr-objcopy)
set(CMAKE_OBJDUMP ${AVR_TOOLCHAIN_PATH}/bin/avr-objdump)
set(CMAKE_SIZE ${AVR_TOOLCHAIN_PATH}/bin/avr-size)

# Set the system name to AVR to enable cross-compiling
set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR avr)
set(CMAKE_CROSS_COMPILING 1)

# Where to look for AVR libraries and headers
set(CMAKE_INCLUDE_PATH "${AVR_INCLUDE_PATH} ${CMAKE_INCLUDE_PATH}")
set(CMAKE_FIND_ROOT_PATH "${AVR_ROOT_PATH} ${CMAKE_FIND_ROOT_PATH}")
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)

# Disable shared libraries
set_property(GLOBAL PROPERTY TARGET_SUPPORTS_SHARED_LIBS FALSE)

# C Compiler flags
set(CMAKE_C_FLAGS "${AVR_C_FLAGS} -Wall -Wextra -Werror -Wfatal-errors")

set(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS} -O0 -g")
set(CMAKE_C_FLAGS_RELWITHDEBINFO "-O2 -g -DNDEBUG")
set(CMAKE_C_FLAGS_RELEASE "-O2 -DNDEBUG")
set(CMAKE_C_FLAGS_MINSIZEREL "-Os -DNDEBUG")

message(STATUS "AVR toolchain path: ${AVR_TOOLCHAIN_PATH}")
message(STATUS "AVR MCU: ${MCU}")
message(STATUS "AVR CPU frequency: ${F_CPU}")
message(STATUS "AVR include directory: ${AVR_INCLUDE_DIR}")
message(STATUS "C Compiler: ${CMAKE_C_COMPILER}")
