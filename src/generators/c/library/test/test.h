#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#ifndef JSB_TEST_H
#define JSB_TEST_H

#include <jsb/jsb.h>

#ifdef PRINTF_TYPE
#include <stdio.h>

#define JSB_TESTS_PRINT(...) fprintf(stderr, __VA_ARGS__)
#else
#pragma message "printf() not found, cannot enable printing in tests"
#define JSB_TESTS_PRINT(...)
#endif

#define ASSERT_JSB(expr)                                                       \
  if ((expr)) {                                                                \
  } else {                                                                     \
    JSB_TESTS_PRINT("%s:%d: Assertion failed: %s\n", __FILE__, __LINE__,       \
                    #expr);                                                    \
    return 1;                                                                  \
  }

#define ASSERT_JSB_OK(expr)                                                    \
  {                                                                            \
    enum jsb_result_t result = expr;                                           \
    if (result != JSB_OK) {                                                    \
      JSB_TESTS_PRINT("%s:%d: Assertion failed: %s\n", __FILE__, __LINE__,     \
                      #expr);                                                  \
      return 1;                                                                \
    }                                                                          \
  }

#endif // JSB_TEST_H

#ifdef __cplusplus
}
#endif // __cplusplus
