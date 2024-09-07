#ifndef JSB_TEST_H
#define JSB_TEST_H

#include <jsb/jsb.h>
#include <stdio.h>

#define ASSERT_JSB(expr)                                                       \
  if (!(expr)) {                                                               \
    fprintf(stderr, "Assertion failed: %s\n", #expr);                          \
    return 1;                                                                  \
  }

#define ASSERT_JSB_OK(expr)                                                    \
  {                                                                            \
    enum jsb_result_t result = expr;                                           \
    if (result != JSB_OK) {                                                    \
      fprintf(stderr, "Assertion failed: %s\n", #expr);                        \
      return 1;                                                                \
    }                                                                          \
  }

#endif // JSB_TEST_H
