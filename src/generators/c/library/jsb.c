#include <jsb/jsb.h>

#if defined(HEADER_FOUND_STRING_H)
#include <string.h>
#endif

#ifdef HAVE_MEMCPY
void* jsb_memcpy(void* dest, const void* src, jsb_uint32_t len) {
  return memcpy(dest, src, len);
}
#else
void* jsb_memcpy(void* dest, const void* src, jsb_uint32_t len) {
  if (dest == NULL || src == NULL) {
    return 0;
  }
  // memcpy(NULL, NULL, 0);
  jsb_uint32_t i = 0;
  while (--len) {
    ((jsb_uint8_t*)dest)[i] = ((jsb_uint8_t*)src)[i];
  }
  return dest;
}
#endif

#ifdef HAVE_STRLEN
jsb_uint32_t jsb_strlen(const jsb_string_t str) {
  return strlen((const char*)str);
}
#else
jsb_uint32_t jsb_strlen(const jsb_string_t str) {
  if (str == NULL) {
    return 0;
  }
  jsb_uint32_t len = 0;
  while (str[len] != '\0') {
    len++;
  }
  return len;
}
#endif
