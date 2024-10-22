#ifndef JSB_C_RAND_H
#define JSB_C_RAND_H

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include <jsb/jsb.h>

void rand_init(void);
void rand_fill(void* buffer, jsb_size_t size);
void rand_fill_float(void* buffer, jsb_size_t size);
void rand_fill_double(void* buffer, jsb_size_t size);

#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_C_RAND_H
