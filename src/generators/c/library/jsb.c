#include <jsb/jsb.h>

#if defined(HEADER_FOUND_STRING_H)
#include <string.h>
#endif

#ifdef MEMCPY_TYPE
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

void* jsb_strncpy(jsb_uint8_t* dest, const jsb_uint8_t* src,
                  const jsb_uint32_t len) {
#if defined(STRNCPY_TYPE)
  return strncpy((char*)dest, (const char*)src, len);
#else
  if (dest == NULL || src == NULL) {
    return NULL;
  }
  jsb_memcpy(dest, src, len);
  dest[len] = '\0';
  return dest;
#endif // STRNCPY_TYPE
}

void* jsb_strcpy(jsb_uint8_t* dest, const jsb_uint8_t* src) {
#ifdef STRCPY_TYPE
  return strcpy((char*)dest, (const char*)src);
#else
  if (dest == NULL || src == NULL) {
    return NULL;
  }
  // Save the original pointer
  jsb_uint8_t* original_dest = dest;

  while ((*dest++ = *src++) != '\0')
    ;

  return original_dest;
#endif // STRCPY_TYPE
}

#ifdef STRLEN_TYPE
jsb_uint32_t jsb_strlen(const jsb_string_t str) {
  return strlen((const char*)str);
}
#else
jsb_uint32_t jsb_strlen(const jsb_string_t str) {
  if (str == NULL) {
    return 0;
  }
  jsb_uint32_t len = 0;
  while (str[len] != 0) {
    len++;
  }
  return len;
}
#endif

#ifdef MEMSET_TYPE
void* jsb_memset(void* dest, const jsb_uint8_t value, const jsb_uint32_t len) {
  return memset(dest, value, len);
}
#else
void* jsb_memset(void* dest, const jsb_uint8_t value, jsb_uint32_t len) {
  if (dest == NULL) {
    return NULL;
  }
  while (--len) {
    ((jsb_uint8_t*)dest)[len] = value;
  }
  return dest;
}
#endif // MEMSET_TYPE
