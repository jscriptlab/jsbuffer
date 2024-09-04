#include <jsb/jsb.h>

jsb_uint32_t jsb_strlen(const jsb_string_t str) {
  if(str == NULL) {
    return 0;
  }
  jsb_uint32_t len = 0;
  while(str[len] != '\0') {
    len++;
  }
  return len;
}