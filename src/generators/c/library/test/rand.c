#include "rand.h"

#include <jsb/jsb.h>

#ifdef __AVR__
#include <avr/io.h>
#include <stdlib.h>
#elif defined(__unix__)
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#endif

#ifdef __AVR__

static uint16_t get_timer_seed() {
#ifdef TCNT0
  return TCNT0;
#elif defined(TCNT0L)
  return TCNT0L;
#else
#error "No suitable timer found for seed generation"
  return 0;
#endif
}

void rand_init() {
  uint16_t seed = get_timer_seed();
  srand(seed);
}

void rand_fill(void* buffer, jsb_size_t size) {
  uint8_t* buf            = (uint8_t*)buffer;
  jsb_size_t num_elements = size / sizeof(uint8_t);
  for (jsb_size_t i = 0; i < num_elements; i++) {
    buf[i] = (uint8_t)rand();
  }
}

void rand_fill_float(void* buffer, jsb_size_t size) {
  jsb_float_t* buf        = (jsb_float_t*)buffer;
  jsb_size_t num_elements = size / sizeof(jsb_float_t);
  for (jsb_size_t i = 0; i < num_elements; i++) {
    buf[i] = (jsb_float_t)rand() / (jsb_float_t)RAND_MAX;
  }
}

void rand_fill_double(void* buffer, jsb_size_t size) {
  jsb_double_t* buf       = (jsb_double_t*)buffer;
  jsb_size_t num_elements = size / sizeof(jsb_double_t);
  for (jsb_size_t i = 0; i < num_elements; i++) {
    buf[i] = (jsb_double_t)rand() / (jsb_double_t)RAND_MAX;
  }
}

#elif defined(__unix__)

void rand_init() {
  srand((unsigned int)time(NULL));
}

void rand_fill(void* buffer, jsb_size_t size) {
  uint8_t* buf            = (uint8_t*)buffer;
  jsb_size_t num_elements = size / sizeof(uint8_t);
  for (jsb_size_t i = 0; i < num_elements; i++) {
    buf[i] = (uint8_t)rand();
  }
}

void rand_fill_float(void* buffer, jsb_size_t size) {
  jsb_float_t* buf        = (jsb_float_t*)buffer;
  jsb_size_t num_elements = size / sizeof(jsb_float_t);
  for (jsb_size_t i = 0; i < num_elements; i++) {
    buf[i] = (jsb_float_t)rand() / (jsb_float_t)RAND_MAX;
  }
}

void rand_fill_double(void* buffer, jsb_size_t size) {
  jsb_double_t* buf       = (jsb_double_t*)buffer;
  jsb_size_t num_elements = size / sizeof(jsb_double_t);
  for (jsb_size_t i = 0; i < num_elements; i++) {
    buf[i] = (jsb_double_t)rand() / (jsb_double_t)RAND_MAX;
  }
}

#endif
