#ifdef __AVR__
#include <avr/io.h>
#elif defined(__unix__)
#include <stdlib.h>
#include <time.h>
#endif

#include "rand.h"

#ifdef __AVR__

static volatile uint16_t timer_seed = 0;

static uint16_t get_timer_seed() {
  // return timer_seed += 1;
#ifdef TCNT0
  return TCNT0;
#elif defined(TCNT0L)
  return TCNT0L;
#else
#error "No suitable timer found for seed generation"
  return 0;
#endif
}

void rand_init(void) {}

#elif defined(__unix__)
static uint16_t get_timer_seed() {
  const int high = (uint8_t)rand();
  const int low  = (uint8_t)rand();

  return (high << 8) | low;
}

void rand_init() {
  srand(time(NULL));
}
#endif

void rand_fill(void* void_buffer, uint16_t size) {
  uint16_t seed       = get_timer_seed(); // Use a timer value as a seed
  uint16_t prng_state = seed;
  jsb_uint8_t* buf    = void_buffer;
  for (uint16_t i = 0; i < size; i++) {
    prng_state = (prng_state * 1103515245 + 12345) & 0x7FFF; // Simple PRNG
    buf[i]     = (prng_state & 0xFF);
  }
}