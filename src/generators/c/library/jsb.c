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
  jsb_uint32_t i = 0;
  while (--len) {
    ((jsb_uint8_t*)dest)[i] = ((jsb_uint8_t*)src)[i];
  }
  return dest;
}
#endif

#ifdef HAVE_STRNCPY
void* jsb_strncpy(jsb_string_t dest, const jsb_string_t src, const jsb_uint32_t len) {
  return strncpy(dest, src, len);
}
#else
void* jsb_strncpy(
  jsb_string_t dest,
  const jsb_string_t src,
  const jsb_uint32_t len
)
{
  if (dest == NULL || src == NULL) {
    return NULL;
  }
  jsb_memcpy(dest, src, len);
  dest[len] = '\0';
  return dest;
}
#endif // HAVE_STRNCPY

#ifdef HAVE_STRCPY
void* jsb_strcpy(jsb_string_t dest, const jsb_string_t src) {
  return jsb_strncpy(dest, src, jsb_strlen(src));
}
#else
void* jsb_strcpy(jsb_string_t dest, const jsb_string_t src) {
  if (dest == NULL || src == NULL) {
    return NULL;
  }
  jsb_strncpy(dest, src, jsb_strlen(src));
  return dest;
}
#endif // HAVE_STRCPY

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

#ifdef HAVE_MEMSET
void* jsb_memset(void* dest, const jsb_uint8_t value, const jsb_uint32_t len) {
  return memset(dest, value, len);
}
#else
void* jsb_memset(void* dest, const jsb_uint8_t value, const jsb_uint32_t len) {
  if (dest == NULL) {
    return NULL;
  }
  while (--len) {
    ((jsb_uint8_t*)dest)[len] = value;
  }
  return dest;
}
#endif // HAVE_MEMSET
